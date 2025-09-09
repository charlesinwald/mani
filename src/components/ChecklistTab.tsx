import React, {useContext, useState} from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import {List} from '@ui-kitten/components';
import {observer} from 'mobx-react-lite';
import {MSTContext} from '../mst';
import ChecklistEntryCard from './ChecklistEntryCard';
import NoData from './NoData';
import {ChecklistEntryType} from '../types/ChecklistEntry';

interface ChecklistTabProps {
  type: string;
  navigation: any;
}

const toCapsObject = {
  shortterm: 'Short Term',
  longterm: 'Long Term',
  lifetime: 'Lifetime',
};

const ChecklistTab = observer<ChecklistTabProps>(({type, navigation}) => {
  const store = useContext(MSTContext);
  const [_, setDummyState] = useState(0);

  // Ensure 'type' is one of the keys of 'toCapsObject'
  const validTypes = Object.keys(toCapsObject) as Array<
    keyof typeof toCapsObject
  >;

  if (!validTypes.includes(type as keyof typeof toCapsObject)) {
    throw new Error(`Invalid type: ${type}`);
  }

  // Split entries into completed and uncompleted
  const filteredData = store.checklistEntries.filter(
    item => item.type === type,
  );
  const uncompletedEntries = filteredData.filter(item => !item.completed);
  const completedEntries = filteredData.filter(item => item.completed);

  const handleComplete = (entry: ChecklistEntryType) => {
    // Logic to mark the entry as completed
    store.updateChecklistEntry({
      ...entry,
      completed: true,
    });
    console.log('Entry completed');
    // Example: Update state or make an API call
  };

  const renderItem = (item: ChecklistEntryType) => {
    console.log('item', item);
    return (
      <ChecklistEntryCard
        desc={item.desc}
        thinkAboutIt={item.thinkAboutIt}
        talkAboutIt={item.talkAboutIt}
        actOnIt={item.actOnIt}
        createdAt={item.createdAt}
        progress_logs={item.progress_logs || []}
        onPress={() => {
          console.log('Pressed');
          navigateToDetail(item._id);
        }}
        onToggleThinkAboutIt={() => {
          console.log('Toggled Think About It');
          store.toggleThinkAboutIt(item._id);
          triggerRerender();
        }}
        onToggleTalkAboutIt={() => {
          console.log('Toggled Talk About It');
          store.toggleTalkAboutIt(item._id);
          triggerRerender();
        }}
        onToggleActOnIt={() => {
          console.log('Toggled Act On It');
          store.toggleActOnIt(item._id);
          triggerRerender();
        }}
        onComplete={() => handleComplete(item)}
        completed={item.completed}
        key={item._id}
      />
    );
  };
  const navigateToDetail = (id: string) => {
    navigation.navigate('ChecklistEntryDetail', {id, type});
  };

  const navigateToAddNew = () => {
    navigation.navigate('ChecklistEntrySingle', {type});
  };

  // Call this function to trigger a re-render
  const triggerRerender = () => {
    setDummyState(prev => prev + 1);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={navigateToAddNew}>
        <Text style={styles.addButtonText}>
          Add New {toCapsObject[type as keyof typeof toCapsObject]} Goal
        </Text>
      </TouchableOpacity>

      <ScrollView style={styles.scrollContainer}>
        {/* Uncompleted Items Section */}
        <View style={styles.section}>
          <Text style={styles.sectionHeader}>In Progress</Text>
          <List
            style={styles.list}
            scrollEnabled={false}
            data={uncompletedEntries}
            renderItem={({item}) => renderItem(item as ChecklistEntryType)}
            ListEmptyComponent={
              <NoData
                title={`Add a new ${type} checklist by pressing + button`}
              />
            }
          />
        </View>

        {/* Completed Items Section */}
        {completedEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Completed</Text>
            <List
              style={styles.list}
              scrollEnabled={false}
              data={completedEntries}
              renderItem={({item}) => renderItem(item as ChecklistEntryType)}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
});

export default ChecklistTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    flex: 1,
  },
  addButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    margin: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  list: {
    backgroundColor: '#f5f5f5',
  },
  section: {
    backgroundColor: '#f5f5f5',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    padding: 10,
    backgroundColor: '#e0e0e0',
  },
});
