import React, {useContext, useState, useEffect} from 'react';
import {StyleSheet, View, Text, TouchableOpacity} from 'react-native';
import {observer, Observer} from 'mobx-react-lite';
import {toJS} from 'mobx';

import {List} from '@ui-kitten/components';

import {MSTContext} from '../mst';

import {EntriesProps} from '../navigation/types';
import {Layout} from '../components/Layout';
import EntryCard from '../components/EntryCard';
import NoData from '../components/NoData';
import Search from '../components/Search';

import {PermissionsAndroid} from 'react-native';
import GestureRecognizer from 'react-native-swipe-gestures';

const Entries: React.FC<EntriesProps> = observer(({navigation}) => {
  const store = useContext(MSTContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setRefreshing] = useState(false);
  const [currentList, setCurrentList] = useState('Short Term');

  const dummy = (status: boolean) => {
    if (!status) {
      setSearchQuery('');
    }
  };

  const handleSearchInput = (q: string) => {
    setSearchQuery(q);
  };

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Search onToggle={dummy} onChangeText={handleSearchInput} />
      ),
    });
  }, [navigation]);

  useEffect(() => {
    refreshData();
    refreshOtherData();
    requestLocationPermission();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshData = () => {
    setRefreshing(true);
    store.populateStoreFromDB();
    setRefreshing(false);
  };

  const refreshOtherData = () => {
    store.user.populateUserFromDB();
  };

  const requestLocationPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Diary App Location Permission',
          message: 'Diary App needs access to your location to log entries.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log('You can use the location');
      } else {
        console.log('Location permission denied');
      }
    } catch (err) {
      console.warn(err);
    }
  };

  const navigateToDetail = (id: string) => {
    navigation.navigate('EntrySingle', {id, newEntry: false});
  };

  const filteredData = store.entries.filter(
    item => item.desc.includes(searchQuery) && item.type === currentList,
  );

  const renderItem = ({item}: any) => {
    return (
      <Observer>
        {() => (
          <EntryCard
            key={`entrycard-${item._id}`}
            desc={item.desc}
            date={item.date}
            onPress={() => navigateToDetail(item._id)}
            mood={item.mood}
          />
        )}
      </Observer>
    );
  };

  const onSwipeLeft = () => {
    if (currentList === 'Lifetime') {
      setCurrentList('Short Term');
    } else if (currentList === 'Short Term') {
      setCurrentList('Long Term');
    }
  };

  const onSwipeRight = () => {
    if (currentList === 'Long Term') {
      setCurrentList('Short Term');
    } else if (currentList === 'Short Term') {
      setCurrentList('Lifetime');
    }
  };

  const renderListHeader = () => (
    <View style={styles.listHeader}>
      {['Lifetime', 'Short Term', 'Long Term'].map(listType => (
        <TouchableOpacity
          key={listType}
          onPress={() => setCurrentList(listType)}>
          <Text
            style={[
              styles.listHeaderText,
              currentList === listType && styles.boldText,
            ]}>
            {listType}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() =>
          navigation.navigate('EntrySingle', {
            id: '',
            newEntry: true,
            listType: currentList,
          })
        }>
        <Text style={styles.addButtonText}>Add New Entry</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <GestureRecognizer
      onSwipeLeft={onSwipeLeft}
      onSwipeRight={onSwipeRight}
      style={styles.container}>
      <Layout>
        {renderListHeader()}
        <List
          style={styles.list}
          contentContainerStyle={styles.contentContainerStyle}
          data={filteredData}
          extraData={toJS(store.entries)}
          renderItem={renderItem}
          refreshing={isRefreshing}
          onRefresh={refreshData}
          ListEmptyComponent={
            <NoData title="Add a new entry by pressing + button" />
          }
        />
      </Layout>
    </GestureRecognizer>
  );
});

export default Entries;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    paddingTop: 20,
    paddingHorizontal: 16,
    backgroundColor: '#E9ECF2',
  },
  contentContainerStyle: {
    paddingBottom: 100,
    flexGrow: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  listHeaderText: {
    fontSize: 16,
    color: '#333',
  },
  boldText: {
    fontWeight: 'bold',
  },
  addButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#007BFF',
    borderRadius: 5,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
  },
});
