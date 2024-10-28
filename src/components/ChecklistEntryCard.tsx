import React from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {Card} from '@ui-kitten/components';
import CheckBox from '@react-native-community/checkbox';

interface ChecklistEntryCardProps {
  desc: string;
  createdAt: number;
  thinkAboutIt: boolean; // Change to boolean
  talkAboutIt: boolean; // Change to boolean
  actOnIt: boolean; // Change to boolean
  onPress: () => void;
  onToggleThinkAboutIt: () => void;
  onToggleTalkAboutIt: () => void;
  onToggleActOnIt: () => void;
}

const ChecklistEntryCard: React.FC<ChecklistEntryCardProps> = ({
  desc,
  thinkAboutIt,
  talkAboutIt,
  actOnIt,
  onPress,
  createdAt,
  onToggleThinkAboutIt,
  onToggleTalkAboutIt,
  onToggleActOnIt,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={1} ellipsizeMode="tail">
              {desc}
            </Text>
            <View style={styles.progressContainer}>
              <Text style={styles.date}>{formattedDate}</Text>
              <View style={styles.checkboxContainer}>
                <Text style={styles.checkboxLabel}>Think about it</Text>
                <CheckBox
                  style={styles.checkbox}
                  value={thinkAboutIt} // Use boolean directly
                  onValueChange={onToggleThinkAboutIt}
                  tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                />
              </View>
              <View style={styles.checkboxContainer}>
                <Text style={styles.checkboxLabel}>Talk about it</Text>
                <CheckBox
                  style={styles.checkbox}
                  value={talkAboutIt} // Use boolean directly
                  onValueChange={onToggleTalkAboutIt}
                  tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                />
              </View>
              <View style={styles.checkboxContainer}>
                <Text style={styles.checkboxLabel}>Act on it</Text>
                <CheckBox
                  style={styles.checkbox}
                  value={actOnIt} // Use boolean directly
                  onValueChange={onToggleActOnIt}
                  tintColors={{true: '#3366FF', false: '#8F9BB3'}}
                />
              </View>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
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
    marginRight: 8,
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
});

export default ChecklistEntryCard;
