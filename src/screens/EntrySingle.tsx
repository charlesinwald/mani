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
import Slider from '@react-native-community/slider'; // Import the Slider component

const initialText = '';

const EntrySingle: React.FC<EntrySingleProps> = observer(
  ({route, navigation}) => {
    const store = useContext(MSTContext);
    console.log('store', JSON.stringify(store.entries, null, 2));
    console.log('memoir store', JSON.stringify(store.memoirEntries, null, 2));
    const [inputData, setInputData] = useState(initialText);
    const [active, setActive] = useState<any>(null);
    // console.log('active', active);
    const [editable, setEditable] = useState(false);
    const [selectedMood, setSelectedMood] = useState(3); // Change initial state to a number (1-5)
    const [location, setLocation] = useState<Location | null>({
      latitude: 0,
      longitude: 0,
    });
    const [address, setAddress] = useState('');
    const [weather, setWeather] = useState('');
    const [temperature, setTemperature] = useState('');
    const [goalType, setGoalType] = useState('Short Term'); // Add state for goal type

    const properNouns = useProperNouns(inputData);

    const isMemoir = route.params?.memoir;
    console.log('isMemoir', isMemoir);

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

        if (isNewEntry) {
          const tempLocation = await getLocation(); // Fetch location only for new entries
          setLocation(tempLocation);
          console.log('isNewEntry condition', isNewEntry);
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
          setSelectedMood(3);
          fetchWeather(tempLocation);
        } else {
          // Handle existing entry
          console.log('else if entryid', store.entries);
          const existingEntry = isMemoir
            ? store.memoirEntries.find(e => e._id === entryId)
            : store.entries.find(e => e._id === entryId);
          console.log('existingEntry', existingEntry);
          if (existingEntry) {
            setActive(existingEntry);
            setInputData(existingEntry.desc);
            setSelectedMood(existingEntry.mood || 3);
            // Load weather and temperature from existing entry
            setWeather(existingEntry.weather);
            setTemperature(existingEntry.temperature);
          }
        }
        console.log('after else if entryid');
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
      const isNewEntry = route.params?.newEntry;
      if (inputData.trim() !== '') {
        if (isNewEntry) {
          if (isMemoir) {
            console.log('Adding memoir entry');
            store.addMemoirEntry({
              _id: uuidv4(),
              date: dayjs(new Date()).format('YYYY-MM-DD'),
              desc: inputData,
              createdAt: dayjs(new Date()).valueOf(),
              modifiedAt: dayjs(new Date()).valueOf(),
              mood: selectedMood,
              latitude: location?.latitude || 0,
              longitude: location?.longitude || 0,
              weather: weather,
              temperature: temperature,
            });
          } else {
            store.addEntry({
              _id: uuidv4(),
              date: dayjs(new Date()).format('YYYY-MM-DD'),
              desc: inputData,
              createdAt: dayjs(new Date()).valueOf(),
              modifiedAt: dayjs(new Date()).valueOf(),
              mood: selectedMood,
              latitude: location?.latitude || 0,
              longitude: location?.longitude || 0,
              weather: weather,
              temperature: temperature,
            });
          }
        } else {
          if (isMemoir) {
            console.log('Updating memoir entry');
            store.updateMemoirEntry({
              ...active,
              _id: active._id,
              date: active.date,
              desc: inputData,
              createdAt: active.createdAt,
              modifiedAt: dayjs(new Date()).valueOf(),
              mood: selectedMood,
              weather: active.weather,
              temperature: active.temperature,
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
              mood: selectedMood,
              weather: active.weather,
              temperature: active.temperature,
            });
          }
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
                <Text style={styles.moodText}>Mood: {selectedMood}</Text>
              </View>
              <Slider
                minimumValue={1}
                maximumValue={5}
                step={1}
                value={selectedMood}
                onValueChange={value => setSelectedMood(value)} // Update mood on slider change
                style={styles.slider}
              />
              {active && active?.modifiedAt !== '' && (
                <Text style={styles.statusText}>
                  Last updated:{' '}
                  <Text>
                    {dayjs(active.modifiedAt).format('DD/MM/YYYY hh:mm A')}
                  </Text>
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
    alignItems: 'center', // Center items horizontally
    marginVertical: 10,
  },
  moodText: {
    fontSize: 16,
    textAlign: 'center',
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
  slider: {
    width: '100%',
    height: 40,
  },
});
