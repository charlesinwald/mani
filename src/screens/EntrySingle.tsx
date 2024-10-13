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
import {Picker} from '@react-native-picker/picker';

const initialText = '';

const EntrySingle: React.FC<EntrySingleProps> = observer(
  ({route, navigation}) => {
    const store = useContext(MSTContext);
    console.log('store', JSON.stringify(store.entries, null, 2));
    const [inputData, setInputData] = useState(initialText);
    const [active, setActive] = useState<any>(null);
    console.log('active', active);
    const [editable, setEditable] = useState(false);
    const [selectedMood, setSelectedMood] = useState(''); // Track mood selection
    const [location, setLocation] = useState<Location | null>({
      latitude: 0,
      longitude: 0,
    });
    const [address, setAddress] = useState('');
    const [weather, setWeather] = useState('');
    const [temperature, setTemperature] = useState('');
    const [goalType, setGoalType] = useState('Short Term'); // Add state for goal type

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
        const entryId = route.params?.id;
        console.log('entryId', entryId);
        const isNewEntry = route.params?.newEntry;
        console.log('isNewEntry', isNewEntry);
        console.log('route.params', route.params);

        const tempLocation = await getLocation();
        setLocation(tempLocation);

        if (isNewEntry) {
          // Handle new entry
          const newEntry = {
            _id: uuidv4(),
            date: dayjs().format('YYYY-MM-DD'),
            desc: '',
            createdAt: dayjs().valueOf(),
            modifiedAt: '',
            mood: 'neutral',
            latitude: tempLocation.latitude,
            longitude: tempLocation.longitude,
            weather: '',
            temperature: '',
            type: goalType, // Use selected goal type
          };
          setActive(newEntry);
          setInputData('');
          setSelectedMood('neutral');
          fetchWeather(tempLocation);
        } else if (entryId) {
          // Handle existing entry
          const existingEntry = store.entries.find(e => e._id === entryId);
          console.log('existingEntry', existingEntry);
          if (existingEntry) {
            setActive(existingEntry);
            setInputData(existingEntry.desc);
            setSelectedMood(existingEntry.mood || 'neutral');
            if (existingEntry.weather && existingEntry.temperature) {
              setWeather(existingEntry.weather);
              setTemperature(existingEntry.temperature);
            } else {
              fetchWeather(tempLocation);
            }
          }
        }
      });

      return unsubscribe;
    }, [navigation, route.params, store.entries, goalType]); // Add goalType to dependencies

    const fetchWeather = async (loc: Location) => {
      if (loc.latitude && loc.longitude) {
        const tempWeather = await getWeather(
          `${loc.latitude},${loc.longitude}`,
        );

        // Assuming the weather data is in the format "Partly cloudy +77°F" or "Partly cloudy -77°F"
        const [weatherDescription, temp] = tempWeather.split(/ [+-]/);
        setWeather(weatherDescription);
        setTemperature(temp);
      }
    };

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
            type: goalType, // Use selected goal type
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
            type: active.type,
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
              {route.params?.newEntry && ( // Conditionally render the Picker for new entries
                <Picker
                  selectedValue={goalType}
                  onValueChange={(itemValue) => setGoalType(itemValue)}
                  style={styles.picker}>
                  <Picker.Item label="Short Term" value="Short Term" />
                  <Picker.Item label="Long Term" value="Long Term" />
                  {/* Add more goal types as needed */}
                </Picker>
              )}
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
  picker: {
    height: 50,
    width: '100%',
    marginVertical: 10,
  },
});