import React, {useState, useContext, useEffect} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import {observer} from 'mobx-react-lite';
import 'react-native-get-random-values';
import {v4 as uuidv4} from 'uuid';
import dayjs from 'dayjs';
import {Card, Button, Text} from '@ui-kitten/components';
import {MSTContext} from '../mst';
import {EntrySingleProps} from '../navigation/types';
import {Layout} from '../components/Layout';
import SadIcon from '../svg/SadIcon';
import HappyIcon from '../svg/HappyIcon';
import NeutralIcon from '../svg/NeutralIcon';
import {findEntryById} from '../db/entry';
import Geolocation from '@react-native-community/geolocation';
import {Location} from '../types/types';
import {reverseGeocode} from '../utils/reverseGeocode';
import {getWeather} from '../utils/weather';
import useProperNouns from '../components/useProperNouns';

const initialText = '';

const EntrySingle: React.FC<EntrySingleProps> = observer(
  ({route, navigation}) => {
    const store = useContext(MSTContext);
    console.log('store', JSON.stringify(store.entries, null, 2));
    const [inputData, setInputData] = useState(initialText);
    const [active, setActive] = useState<any>(null);
    const [editable, setEditable] = useState(false);
    const [selectedMood, setSelectedMood] = useState(''); // Track mood selection
    const [location, setLocation] = useState<Location | null>({
      latitude: 0,
      longitude: 0,
    });
    const [address, setAddress] = useState('');
    const [weather, setWeather] = useState('');
    const [temperature, setTemperature] = useState('');

    const properNouns = useProperNouns(inputData);

    useEffect(() => {
      const fetchLocation = async () => {
        const tempLocation = await getLocation();
        setLocation(tempLocation);
      };
      fetchLocation();
    }, []);

    useEffect(() => {
      const fetchAddressAndWeather = async () => {
        const tempAddress =
          location?.latitude &&
          location.longitude &&
          (await reverseGeocode(location?.latitude, location?.longitude));
        setAddress(tempAddress);

        if (!active?.weather || !active?.temperature) {
          const tempWeather = await getWeather(
            `${location?.latitude},${location?.longitude}`,
          );
          console.log('Weather:', tempWeather);

          // Assuming the weather data is in the format "Partly cloudy +77°F" or "Partly cloudy -77°F"
          const [weatherDescription, temp] = tempWeather.split(/ [+-]/);
          setWeather(weatherDescription);
          setTemperature(temp);
        } else {
          setWeather(active.weather);
          setTemperature(active.temperature);
        }
      };
      fetchAddressAndWeather();
    }, [location, active]);

    const getLocation = async (): Promise<Location> => {
      return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
          position => {
            const {latitude, longitude} = position.coords;
            console.log('Location: ', latitude, longitude);
            resolve({latitude, longitude});
          },
          error => {
            console.log('Error getting location', error);
            reject(error);
          },
          {enableHighAccuracy: true, timeout: 15000, maximumAge: 10000},
        );
      });
    };

    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', async () => {
        setInputData(initialText); // Reset the input data
        const entryId = route.params?.id; // Get the entry ID from the route params
        if (route.params?.newEntry) {
          setActive(null);
          setInputData('');
        }
        console.log('entryId', entryId);
        if (entryId) {
          // Find the entry in the store instead of using findEntryById
          const temp = store.entries.find(entry => entry._id === entryId);
          console.log('temp', temp);
          if (temp) {
            console.log('temp', temp);
            setActive(temp); // Set the active entry
            setInputData(temp.desc); // Set the description from the entry
            const mood = temp.mood || 'neutral'; // Default to 'neutral' if no mood
            setSelectedMood(mood);

            // If location not available in the entry, fetch and update it
            if (temp.latitude === 0 && temp.longitude === 0) {
              const tempLocation = await getLocation();
              setLocation(tempLocation);
              setActive({
                ...temp,
                latitude: tempLocation.latitude,
                longitude: tempLocation.longitude,
              });
            } else {
              setLocation({
                latitude: temp.latitude,
                longitude: temp.longitude,
              });
            }
          }
        } else {
          // Handle case where no entry is found (perhaps new entry scenario)
          const tempLocation = await getLocation();
          const newItem = {
            _id: uuidv4(),
            date: dayjs(new Date()).format('YYYY-MM-DD'),
            desc: '',
            createdAt: dayjs(new Date()).valueOf(),
            modifiedAt: '',
            mood: 'neutral', // Default mood
            latitude: tempLocation.latitude,
            longitude: tempLocation.longitude,
            weather: '', // Initialize weather
            temperature: '', // Initialize temperature
          };
          setActive(newItem);
        }
      });

      return unsubscribe;
    }, [route, navigation, store]);

    const deleteEntry = () => {
      Alert.alert(
        'Are you sure?',
        'This will permanently delete the entry from the device',
        [
          {
            text: 'Cancel',
            onPress: () => {},
            style: 'cancel',
          },
          {text: 'OK', onPress: () => confirmDelete()},
        ],
      );
    };

    const confirmDelete = () => {
      // Clear entry from text input
      setInputData(initialText);

      // Delete from Store
      if (active) {
        // Edge case: Empty entry but not saved in MST and DB
        if (active.desc?.trim() === '') {
          return;
        }
        store.deleteEntry(active);
        setActive(null);
        navigation.goBack();
      }
    };

    const addEntry = () => {
      console.log('Saving entry:', active ? active._id : 'new entry');
      console.log('saving Mood:', selectedMood);
      if (inputData.trim() !== '') {
        if (!active) {
          store.addEntry({
            _id: uuidv4(),
            date: dayjs(new Date()).format('YYYY-MM-DD'),
            desc: inputData,
            createdAt: dayjs(new Date()).valueOf(),
            modifiedAt: dayjs(new Date()).valueOf(),
            mood: selectedMood, // Add mood to the entry
            latitude: location?.latitude || 0,
            longitude: location?.longitude || 0,
            weather: weather, // Add weather to the entry
            temperature: temperature, // Add temperature to the entry
          });
        } else {
          store.updateEntry({
            ...active,
            _id: active._id,
            date: active.date,
            createdAt: active.createdAt,
            desc: inputData,
            modifiedAt: dayjs(new Date()).valueOf(),
            mood: selectedMood, // Update mood in the entry
            weather: active.weather, // Keep existing weather
            temperature: active.temperature, // Keep existing temperature
          });
        }
      }

      setInputData(initialText);
      setActive(null);
      navigation.goBack();
    };

    return (
      <Layout level="1">
        <ScrollView contentContainerStyle={styles.scrollview}>
          <Card>
            <View>
              {address ? (
                <View>
                  <Text>{address}</Text>
                  {weather ? <Text>{weather}</Text> : null}
                  {temperature ? <Text>{temperature}</Text> : null}
                </View>
              ) : (
                <Text>Location not available</Text> // Handle case where location is null or undefined
              )}
            </View>

            <View style={styles.inner}>
              {editable ? (
                <TextInput
                  autoFocus
                  value={inputData}
                  style={styles.textArea}
                  multiline={true}
                  onChangeText={(text: string) => setInputData(text)}
                  onBlur={addEntry}
                />
              ) : (
                <TouchableOpacity onPress={() => setEditable(true)}>
                  <View style={styles.textWrapper}>
                    <Text>{inputData ? inputData : 'Tap to Edit'}</Text>
                  </View>
                </TouchableOpacity>
              )}
              <View style={styles.moodWrapper}>
                <Button
                  style={[
                    styles.moodButton,
                    selectedMood === 'sad' && styles.selectedMood,
                  ]}
                  onPress={() => setSelectedMood('sad')}
                  status="danger"
                  accessoryLeft={props => <SadIcon {...props} fill="#FFFFFF" />}
                />
                <Button
                  style={[
                    styles.moodButton,
                    selectedMood === 'neutral' && styles.selectedMood,
                  ]}
                  onPress={() => setSelectedMood('neutral')}
                  status="warning"
                  accessoryLeft={props => (
                    <NeutralIcon {...props} fill="#FFFFFF" />
                  )}
                />
                <Button
                  style={[
                    styles.moodButton,
                    selectedMood === 'happy' && styles.selectedMood,
                  ]}
                  onPress={() => setSelectedMood('happy')}
                  status="success"
                  accessoryLeft={props => (
                    <HappyIcon {...props} fill="#FFFFFF" />
                  )}
                />
              </View>
              {active && active?.modifiedAt !== '' && (
                <Text style={styles.statusText}>
                  Last updated:{' '}
                  {dayjs(active.modifiedAt).format('DD/MM/YYYY hh:mm A')}
                </Text>
              )}
              <View style={styles.btnWrp}>
                <Button
                  size="small"
                  status="primary"
                  style={[styles.btn, styles.btnSave]}
                  onPress={addEntry}>
                  Save
                </Button>

                <Button
                  size="small"
                  style={styles.btn}
                  status="danger"
                  onPress={deleteEntry}>
                  Discard
                </Button>
              </View>
              <View style={styles.container}>
                {properNouns.length > 0 ? (
                  <View>
                    <Text style={styles.result}>Detected Names:</Text>
                    {properNouns.map((noun, index) => (
                      <Text key={index} style={styles.entity}>
                        {noun.text} - {noun.type}
                      </Text>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noResult}>No proper nouns detected</Text>
                )}
              </View>
            </View>
          </Card>
        </ScrollView>
      </Layout>
    );
  },
);

export default EntrySingle;

const styles = StyleSheet.create({
  scrollview: {
    flexGrow: 1,
    paddingTop: 20,
    paddingBottom: 100,
    paddingHorizontal: 15,
  },
  inner: {
    paddingVertical: 5,
  },
  textWrapper: {
    minHeight: 180,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 0,
    borderRadius: 8,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#E9ECF2',
    fontSize: 14,
  },
  textArea: {
    height: 180,
    paddingHorizontal: 10,
    borderWidth: 0,
    borderRadius: 8,
    textAlignVertical: 'top',
    marginBottom: 20,
    backgroundColor: '#E9ECF2',
    fontSize: 15,
  },
  btnWrp: {
    // flexDirection: 'row',
    // justifyContent: 'space-between',
  },
  btn: {
    marginBottom: 10,
  },
  btnSave: {},
  moodWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  moodButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  selectedMood: {
    borderWidth: 2,
    borderColor: '#000',
  },
  statusText: {
    fontSize: 11,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  container: {
    padding: 16,
    justifyContent: 'center',
  },
  result: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  entity: {
    fontSize: 16,
    marginTop: 4,
  },
  noResult: {
    marginTop: 12,
    fontSize: 16,
    fontStyle: 'italic',
    color: 'gray',
  },
});