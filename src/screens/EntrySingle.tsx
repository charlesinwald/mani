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

const initialText = '';

const EntrySingle: React.FC<EntrySingleProps> = observer(
  ({route, navigation}) => {
    const store = useContext(MSTContext);
    const [inputData, setInputData] = React.useState(initialText);
    const [active, setActive] = useState<any>(null);
    const [editable, setEditable] = useState(false);
    const [selectedMood, setSelectedMood] = useState(''); // Track mood selection

    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        setInputData(initialText); // Reset the input data
        const entryId = route.params?.id; // Get the entry ID from the route params

        if (entryId) {
          const temp = findEntryById(entryId); // Find the entry by `_id`
          console.log('loading temp:', temp);
          if (temp) {
            setActive(temp); // Set the active entry
            setInputData(temp.desc); // Set the description from the entry
            const mood = temp.mood || 'neutral'; // Default to 'neutral' if no mood
            setSelectedMood(mood);
          }
        } else {
          // Handle case where no entry is found (perhaps new entry scenario)
          let newItem = {
            _id: uuidv4(),
            date: dayjs(new Date()).format('YYYY-MM-DD'),
            desc: '',
            createdAt: dayjs(new Date()).valueOf(),
            modifiedAt: '',
            mood: 'neutral', // Default mood
          };
          setActive(newItem);
        }

        // Instead of resetting the whole params object, reset specific values or avoid resetting if not needed.
        navigation.setParams({id: undefined}); // Safely reset the id param if needed
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
                {editable && (
                  <Button
                    size="small"
                    status="primary"
                    style={[styles.btn, styles.btnSave]}
                    onPress={addEntry}>
                    Save
                  </Button>
                )}
                <Button
                  size="small"
                  style={styles.btn}
                  status="danger"
                  onPress={deleteEntry}>
                  Discard
                </Button>
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
});
