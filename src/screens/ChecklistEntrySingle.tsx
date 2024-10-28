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
import dayjs from 'dayjs';
import {Card, Button, Text} from '@ui-kitten/components';
import {MSTContext} from '../mst';
import {ChecklistEntrySingleProps} from '../navigation/types';
import {Layout} from '../components/Layout';
import useProperNouns from '../components/useProperNouns';
import {Picker} from '@react-native-picker/picker';

const initialText = '';

const ChecklistEntrySingle: React.FC<ChecklistEntrySingleProps> = observer(
  ({route, navigation}) => {
    const store = useContext(MSTContext);
    const [inputData, setInputData] = useState(initialText);
    const [active, setActive] = useState<any>(null);
    const [editable, setEditable] = useState(false);
    const [goalType, setGoalType] = useState<
      'shortterm' | 'longterm' | 'lifetime'
    >(
      (route.params?.type as 'shortterm' | 'longterm' | 'lifetime') ||
        'shortterm',
    );

    const properNouns = useProperNouns(inputData);

    useEffect(() => {
      const unsubscribe = navigation.addListener('focus', () => {
        const entryId = route.params?.id;
        const isNewEntry = route.params?.newEntry;

        if (isNewEntry) {
          const newEntry = {
            date: dayjs().format('YYYY-MM-DD'),
            desc: '',
            createdAt: dayjs().valueOf(),
            modifiedAt: '',
            type: goalType,
            thinkAboutIt: false, // Initialize new property
            talkAboutIt: false, // Initialize new property
            actOnIt: false, // Initialize new property
            isCompleted: false,
          };
          setActive(newEntry);
          setInputData('');
        } else if (entryId) {
          const existingEntry = store.checklistEntries.find(
            e => e._id === entryId,
          );
          if (existingEntry) {
            setActive(existingEntry);
            setInputData(existingEntry.desc);
            setGoalType(existingEntry.type);
          }
        }
      });

      return unsubscribe;
    }, [navigation, route.params, store.checklistEntries, goalType]);

    const deleteEntry = () => {
      Alert.alert(
        'Are you sure?',
        'This will permanently delete the checklist entry from the device',
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
      setInputData(initialText);
      if (active) {
        if (active.desc?.trim() === '') {
          return;
        }
        store.deleteChecklistEntry(active);
        setActive(null);
        navigation.goBack();
      }
    };

    const addEntry = () => {
      if (inputData.trim() !== '') {
        const entryData = {
          type: goalType,
          desc: inputData,
          thinkAboutIt: active?.thinkAboutIt || false, // Use existing or default
          talkAboutIt: active?.talkAboutIt || false, // Use existing or default
          actOnIt: active?.actOnIt || false, // Use existing or default
          isCompleted: false,
          createdAt: dayjs().valueOf(),
          modifiedAt: dayjs().valueOf(),
        };

        if (!active) {
          store.addChecklistEntry(entryData);
        } else {
          store.updateChecklistEntry({
            ...active,
            _id: active._id,
            type: goalType,
            createdAt: active.createdAt,
            desc: inputData,
            modifiedAt: dayjs(new Date()).valueOf(),
            thinkAboutIt: active.thinkAboutIt,
            talkAboutIt: active.talkAboutIt,
            actOnIt: active.actOnIt,
          });
        }
      } else {
        Alert.alert('Error', 'Description cannot be empty.');
      }

      setInputData(initialText);
      setActive(null);
      navigation.navigate('ChecklistEntries');
    };

    const toggleThinkAboutIt = () => {
      if (active) {
        store.toggleThinkAboutIt(active._id);
        setActive({...active, thinkAboutIt: !active.thinkAboutIt});
      }
    };

    const toggleTalkAboutIt = () => {
      if (active) {
        store.toggleTalkAboutIt(active._id);
        setActive({...active, talkAboutIt: !active.talkAboutIt});
      }
    };

    const toggleActOnIt = () => {
      if (active) {
        store.toggleActOnIt(active._id);
        setActive({...active, actOnIt: !active.actOnIt});
      }
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
                <Text style={styles.result}>Actions:</Text>
                <TouchableOpacity onPress={toggleThinkAboutIt}>
                  <Text style={styles.actionText}>
                    {active?.thinkAboutIt
                      ? '✓ Think About It'
                      : 'Think About It'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleTalkAboutIt}>
                  <Text style={styles.actionText}>
                    {active?.talkAboutIt ? '✓ Talk About It' : 'Talk About It'}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleActOnIt}>
                  <Text style={styles.actionText}>
                    {active?.actOnIt ? '✓ Act On It' : 'Act On It'}
                  </Text>
                </TouchableOpacity>
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
              <Picker
                selectedValue={goalType}
                onValueChange={itemValue => setGoalType(itemValue)}
                style={styles.picker}>
                <Picker.Item label="Short Term" value="shortterm" />
                <Picker.Item label="Long Term" value="longterm" />
                <Picker.Item label="Lifetime" value="lifetime" />
              </Picker>
            </View>
          </Card>
        </ScrollView>
      </Layout>
    );
  },
);

export default ChecklistEntrySingle;

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
  actionText: {
    fontSize: 16,
    marginTop: 4,
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
