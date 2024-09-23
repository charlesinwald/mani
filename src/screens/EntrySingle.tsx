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

import {Card, Button, Text, Icon} from '@ui-kitten/components';

import {MSTContext} from '../mst';

import {EntrySingleProps} from '../navigation/types';
import {Layout} from '../components/Layout';
import SadIcon from '../svg/SadIcon';
import HappyIcon from '../svg/HappyIcon';
import NeutralIcon from '../svg/NeutralIcon';

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
        setInputData(initialText);
        let tempDate;
        if (route.params?.date && route.params?.date !== '') {
          tempDate = dayjs(new Date(route.params.date)).format('YYYY-MM-DD');
        } else {
          tempDate = dayjs(new Date()).format('YYYY-MM-DD');
        }

        const temp = store.findEntryByDate(tempDate);
        if (temp.length) {
          setActive(temp[0]);
          setInputData(temp[0].desc);

          // If the mood is missing, assign a default mood
          const mood = temp[0].mood || 'neutral'; // Default to 'neutral' if mood is missing
          setSelectedMood(mood);
        } else {
          let newItem = {
            _id: uuidv4(),
            date: dayjs(tempDate).format('YYYY-MM-DD'),
            desc: '',
            createdAt: dayjs(tempDate).valueOf(),
            modifiedAt: '',
            mood: 'neutral', // Default mood for new entries
          };
          setActive(newItem);
        }
        navigation.setParams({date: ''});
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
