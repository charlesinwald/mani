import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import {Card, Icon} from '@ui-kitten/components';
import CheckBox from '@react-native-community/checkbox';

interface ChecklistEntryCardProps {
  desc: string;
  createdAt: number;
  thinkAboutIt: boolean; // Change to boolean
  talkAboutIt: boolean; // Change to boolean
  actOnIt: boolean; // Change to boolean
  completed: boolean;
  onPress: () => void;
  onToggleThinkAboutIt: () => void;
  onToggleTalkAboutIt: () => void;
  onToggleActOnIt: () => void;
  onComplete: () => void; // New prop
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
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const [showTrashDialog, setShowTrashDialog] = React.useState(false);
  const [showAwardDialog, setShowAwardDialog] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isCompleting, setIsCompleting] = React.useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

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
                        onValueChange={onToggleThinkAboutIt}
                        tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                      />
                    </View>
                    <View style={styles.checkboxContainer}>
                      <Text style={styles.checkboxLabel}>Talk about it</Text>
                      <CheckBox
                        style={styles.checkbox}
                        value={talkAboutIt}
                        onValueChange={onToggleTalkAboutIt}
                        tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                      />
                    </View>
                    <View style={styles.checkboxContainer}>
                      <Text style={styles.checkboxLabel}>Act on it</Text>
                      <CheckBox
                        style={styles.checkbox}
                        value={actOnIt}
                        onValueChange={onToggleActOnIt}
                        tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                      />
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>
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
    // justifyContent: 'center',
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
});

export default ChecklistEntryCard;
