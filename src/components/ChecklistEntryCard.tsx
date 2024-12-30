import React, {useContext, useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
  TextInput,
} from 'react-native';
import {Card, Icon} from '@ui-kitten/components';
import CheckBox from '@react-native-community/checkbox';
import {ChecklistLogType} from '../types/ChecklistLogType';
import {MSTContext} from '../mst';
import {v4 as uuidv4} from 'uuid';

interface ChecklistEntryCardProps {
  desc: string;
  createdAt: number;
  thinkAboutIt: boolean; // Change to boolean
  talkAboutIt: boolean; // Change to boolean
  actOnIt: boolean; // Change to boolean
  completed: boolean;
  onPress: () => void;
  onToggleThinkAboutIt: (note?: string) => void;
  onToggleTalkAboutIt: (note?: string) => void;
  onToggleActOnIt: (note?: string) => void;
  onComplete: () => void; // New prop
  progress_logs: any[];
}

const ChecklistEntryCard: React.FC<ChecklistEntryCardProps> = ({
  desc,
  thinkAboutIt,
  talkAboutIt,
  actOnIt,
  completed,
  onPress,
  createdAt,
  onToggleThinkAboutIt,
  onToggleTalkAboutIt,
  onToggleActOnIt,
  onComplete,
  progress_logs,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const store = useContext(MSTContext);

  const [showTrashDialog, setShowTrashDialog] = React.useState(false);
  const [showAwardDialog, setShowAwardDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const [showNoteDialog, setShowNoteDialog] = React.useState(false);
  const [noteText, setNoteText] = React.useState('');
  const [activeCheckbox, setActiveCheckbox] = React.useState<
    'think' | 'talk' | 'act' | null
  >(null);
  // const [showLogDialog, setShowLogDialog] = React.useState(false);
  // const [logNote, setLogNote] = React.useState('');
  // const [logType, setLogType] = React.useState<'think' | 'talk' | 'act'>('think');

  console.log('ChecklistEntryCard');
  console.log('desc', desc);
  // console.log('progress_logs', JSON.stringify(progress_logs));

  const resetProgress = () => {
    progressAnim.setValue(0);
    setIsDeleting(false);
    setIsCompleting(false);
    setShowTrashDialog(false);
    setShowAwardDialog(false);
  };

  const startProgress = (actionType: 'delete' | 'complete') => {
    progressAnim.setValue(0);
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 3000,
      useNativeDriver: false,
    }).start(({finished}) => {
      if (finished) {
        if (actionType === 'complete') {
          onComplete(); // Call the completion handler
        }
        resetProgress();
      } else {
        resetProgress();
      }
    });
  };

  const handleCheckboxToggle = (
    type: 'think' | 'talk' | 'act',
    currentValue: boolean,
  ) => {
    if (!currentValue) {
      // Just toggle the checkbox without showing dialog
      switch (type) {
        case 'think':
          onToggleThinkAboutIt();
          break;
        case 'talk':
          onToggleTalkAboutIt();
          break;
        case 'act':
          onToggleActOnIt();
          break;
      }
    } else {
      // If unchecking, just toggle without note
      switch (type) {
        case 'think':
          onToggleThinkAboutIt();
          break;
        case 'talk':
          onToggleTalkAboutIt();
          break;
        case 'act':
          onToggleActOnIt();
          break;
      }
    }
  };

  const handleNoteSave = () => {
    switch (activeCheckbox) {
      case 'think':
        onToggleThinkAboutIt(noteText);
        break;
      case 'talk':
        onToggleTalkAboutIt(noteText);
        break;
      case 'act':
        onToggleActOnIt(noteText);
        break;
    }
    setNoteText('');
    setShowNoteDialog(false);
    setActiveCheckbox(null);
    const entry = store.checklistEntries.find(e => e.desc === desc);
    entry &&
      store.addChecklistLog({
        _id: uuidv4(),
        checklistId: entry._id,
        timestamp: new Date().toISOString(),
        type: logType,
        note: logNote,
      });
  };

  return (
    <View>
      <TouchableOpacity onPress={onPress}>
        <Card style={styles.card}>
          <View style={styles.iconsBar}>
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => {
                setShowTrashDialog(true);
                setShowAwardDialog(false);
              }}>
              <Icon style={styles.icon} fill="#8F9BB3" name="trash-2-outline" />
            </TouchableOpacity>
            {!completed && (
              <TouchableOpacity
                style={styles.iconContainer}
                onPress={() => {
                  setShowAwardDialog(true);
                  setShowTrashDialog(false);
                }}>
                <Icon style={styles.icon} fill="#8F9BB3" name="award-outline" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.cardContent}>
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
                {desc}
              </Text>

              <View style={styles.progressContainer}>
                <Text style={styles.date}>{formattedDate}</Text>
                {!completed && (
                  <>
                    <View style={styles.checkboxContainer}>
                      <Text style={styles.checkboxLabel}>Think about it</Text>
                      <CheckBox
                        style={styles.checkbox}
                        value={thinkAboutIt}
                        onValueChange={() =>
                          handleCheckboxToggle('think', thinkAboutIt)
                        }
                        tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                      />
                    </View>
                    <View style={styles.checkboxContainer}>
                      <Text style={styles.checkboxLabel}>Talk about it</Text>
                      <CheckBox
                        style={styles.checkbox}
                        value={talkAboutIt}
                        onValueChange={() =>
                          handleCheckboxToggle('talk', talkAboutIt)
                        }
                        tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                      />
                    </View>
                    <View style={styles.checkboxContainer}>
                      <Text style={styles.checkboxLabel}>Act on it</Text>
                      <CheckBox
                        style={styles.checkbox}
                        value={actOnIt}
                        onValueChange={() =>
                          handleCheckboxToggle('act', actOnIt)
                        }
                        tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* {!completed && (
            <>
              <TouchableOpacity
                onPress={() => setShowLogDialog(true)}
                style={styles.logButton}>
                <Text style={styles.logButtonText}>Add Progress Log</Text>
              </TouchableOpacity> *

              {/* {progress_logs && progress_logs.length > 0 && (
                <View style={styles.logsContainer}>
                  {progress_logs.map((log, index) => (
                    <View key={log._id || index} style={styles.logItem}>
                      <Text style={styles.logType}>
                        {log.type === 'think'
                          ? 'Thought about'
                          : log.type === 'talk'
                          ? 'Talked about'
                          : 'Acted on'}
                      </Text>
                      <Text style={styles.logNote}>{log.note}</Text>
                      <Text style={styles.logTimestamp}>
                        {new Date(log.timestamp).toLocaleDateString()}
                      </Text>
                    </View>
                  ))}
                </View>
              )} */}
            {/* </>
          )} */}

          {isCompleting && (
            <Animated.View
              style={[
                styles.progressBar,
                styles.completeProgress,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          )}
          {isDeleting && (
            <Animated.View
              style={[
                styles.progressBar,
                styles.deleteProgress,
                {
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                },
              ]}
            />
          )}
        </Card>
      </TouchableOpacity>

      {showTrashDialog && (
        <View style={styles.dialog}>
          <Text>Hold to delete this item</Text>
          <View style={styles.dialogButtons}>
            <TouchableOpacity onPress={() => setShowTrashDialog(false)}>
              <Text style={styles.dialogButton}>Cancel</Text>
            </TouchableOpacity>
            <View>
              <Pressable
                delayLongPress={3000}
                onPressIn={() => {
                  setIsDeleting(true);
                  startProgress();
                }}
                onPressOut={() => {
                  if (progressAnim.__getValue() < 1) {
                    resetProgress();
                  }
                }}>
                <Text style={[styles.dialogButton, styles.deleteButton]}>
                  Delete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showAwardDialog && (
        <View style={styles.dialog}>
          <Text>Hold to mark as completed</Text>
          <View style={styles.dialogButtons}>
            <TouchableOpacity onPress={() => setShowAwardDialog(false)}>
              <Text style={styles.dialogButton}>Cancel</Text>
            </TouchableOpacity>
            <View>
              <Pressable
                delayLongPress={3000}
                onPressIn={() => {
                  setIsCompleting(true);
                  startProgress('complete'); // Trigger "complete" action
                }}
                onPressOut={() => {
                  if (progressAnim.__getValue() < 1) {
                    resetProgress();
                  }
                }}>
                <Text style={[styles.dialogButton, styles.completeButton]}>
                  Complete
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}

      {showNoteDialog && (
        <View style={styles.dialog}>
          <Text>
            Add a note about what you{' '}
            {activeCheckbox === 'think'
              ? 'thought about'
              : activeCheckbox === 'talk'
              ? 'talked about'
              : 'acted on'}
          </Text>
          <TextInput
            style={styles.noteInput}
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Enter your note here"
            multiline
          />
          <View style={styles.dialogButtons}>
            <TouchableOpacity
              onPress={() => {
                setShowNoteDialog(false);
                setNoteText('');
                setActiveCheckbox(null);
              }}>
              <Text style={styles.dialogButton}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleNoteSave}>
              <Text style={[styles.dialogButton, styles.saveButton]}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* {showLogDialog && (
        <Modal
          visible={showLogDialog}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLogDialog(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Add Progress Log</Text>

              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    logType === 'think' && styles.typeButtonActive,
                  ]}
                  onPress={() => setLogType('think')}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      logType === 'think' && styles.typeButtonTextActive,
                    ]}>
                    Think
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    logType === 'talk' && styles.typeButtonActive,
                  ]}
                  onPress={() => setLogType('talk')}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      logType === 'talk' && styles.typeButtonTextActive,
                    ]}>
                    Talk
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    logType === 'act' && styles.typeButtonActive,
                  ]}
                  onPress={() => setLogType('act')}>
                  <Text
                    style={[
                      styles.typeButtonText,
                      logType === 'act' && styles.typeButtonTextActive,
                    ]}>
                    Act
                  </Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.logInput}
                value={logNote}
                onChangeText={setLogNote}
                placeholder="What did you do?"
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  onPress={() => {
                    setShowLogDialog(false);
                    setLogNote('');
                  }}>
                  <Text style={styles.dialogButton}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (logNote.trim()) {
                      const entry = store.checklistEntries.find(
                        item => item.desc === desc,
                      );
                      console.log('entry', entry);
                      switch (logType) {
                        case 'think':
                          entry &&
                            store.addChecklistLog({
                              _id: uuidv4(),
                              checklistId: entry._id,
                              timestamp: new Date().toISOString(),
                              type: 'think',
                              note: logNote,
                            });
                          onToggleThinkAboutIt(logNote);
                          break;
                        case 'talk':
                          entry &&
                            store.addChecklistLog({
                              _id: uuidv4(),
                              checklistId: entry._id,
                              timestamp: new Date().toISOString(),
                              type: 'talk',
                              note: logNote,
                            });
                          onToggleTalkAboutIt(logNote);
                          break;
                        case 'act':
                          entry &&
                            store.addChecklistLog({
                              _id: uuidv4(),
                              checklistId: entry._id,
                              timestamp: new Date().toISOString(),
                              type: 'act',
                              note: logNote,
                            });
                          onToggleActOnIt(logNote);
                          break;
                      }
                      setLogNote('');
                      setShowLogDialog(false);
                    }
                  }}>
                  <Text style={[styles.dialogButton, styles.saveButton]}>
                    Save
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )} */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    padding: 0,
  },
  cardContent: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginHorizontal: 8,
  },
  date: {
    fontSize: 12,
    color: '#8F9BB3',
  },
  progressContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 4,
  },
  checkboxLabel: {},
  checkbox: {
    alignSelf: 'flex-end',
  },
  iconContainer: {
    padding: 4,
  },
  iconsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  icon: {
    width: 24,
    height: 24,
  },
  dialog: {
    backgroundColor: 'white',
    padding: 16,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  dialogButton: {
    marginLeft: 16,
    fontSize: 14,
    fontWeight: '600',
    padding: 8,
    paddingBottom: 8,
  },
  deleteButton: {
    color: '#FF3D71',
  },
  completeButton: {
    color: '#00E096',
  },
  progressBar: {
    height: 16,
    position: 'absolute',
    bottom: 0,
    left: -16,
    right: -16,
    width: 'auto',
    marginHorizontal: 16,
  },
  deleteProgress: {
    backgroundColor: '#000',
  },
  completeProgress: {
    backgroundColor: '#000',
  },
  noteInput: {
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 4,
    padding: 8,
    marginTop: 8,
    minHeight: 80,
  },
  saveButton: {
    color: '#3366FF',
  },
  checkboxActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logButton: {
    backgroundColor: '#E4E9F2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    marginTop: 8,
    marginHorizontal: 8,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  logButtonText: {
    fontSize: 14,
    color: '#3366FF',
    fontWeight: '600',
  },
  logsContainer: {
    padding: 8,
  },
  logItem: {
    backgroundColor: '#F7F9FC',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  logType: {
    fontWeight: '600',
    fontSize: 14,
    color: '#3366FF',
    marginBottom: 4,
  },
  logNote: {
    fontSize: 14,
    marginBottom: 4,
  },
  logTimestamp: {
    fontSize: 12,
    color: '#8F9BB3',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  typeButton: {
    flex: 1,
    padding: 8,
    alignItems: 'center',
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: '#F7F9FC',
  },
  typeButtonActive: {
    backgroundColor: '#3366FF',
  },
  typeButtonText: {
    color: '#000000',
  },
  typeButtonTextActive: {
    color: '#FFFFFF',
  },
  logInput: {
    borderWidth: 1,
    borderColor: '#E4E9F2',
    borderRadius: 4,
    padding: 8,
    minHeight: 80,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default ChecklistEntryCard;
