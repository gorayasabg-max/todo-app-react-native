import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Pressable, SafeAreaView, StatusBar, Text, TextInput, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api} from './src/api';
import './global.css';

const STORAGE_KEY = '@todo_app_local_fallback';

export default function App() {
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [online, setOnline] = useState(true);

  useEffect(() => { loadTodos(); }, []);

  const loadTodos = async () => {
    try {
      const res = await api.get('/todos');
      setTodos(res.data);
      setOnline(true);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
    } catch (e) {
      setOnline(false);
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      setTodos(saved ? JSON.parse(saved) : []);
    } finally { setLoading(false); }
  };

  const addTodo = async () => {
    const clean = title.trim();
    if (!clean) return;
    try {
      const res = await api.post('/todos', {title: clean});
      setTodos(prev => [res.data, ...prev]);
      setOnline(true);
    } catch (e) {
      const local = {id: `local-${Date.now()}`, title: clean, completed: false};
      const next = [local, ...todos];
      setTodos(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setOnline(false);
    }
    setTitle('');
  };

  const toggleTodo = async item => {
    try {
      const res = await api.patch(`/todos/${item._id || item.id}`, {completed: !item.completed});
      setTodos(prev => prev.map(t => (t._id === item._id ? res.data : t)));
      setOnline(true);
    } catch (e) {
      const next = todos.map(t => t.id === item.id ? {...t, completed: !t.completed} : t);
      setTodos(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setOnline(false);
    }
  };

  const deleteTodo = item => Alert.alert('Delete Todo', 'Are you sure?', [
    {text: 'Cancel', style: 'cancel'},
    {text: 'Delete', style: 'destructive', onPress: async () => {
      try { await api.delete(`/todos/${item._id || item.id}`); setTodos(prev => prev.filter(t => (t._id || t.id) !== (item._id || item.id))); }
      catch (e) { const next = todos.filter(t => t.id !== item.id); setTodos(next); await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)); setOnline(false); }
    }}
  ]);

  const renderItem = ({item}) => (
    <View className="mb-3 flex-row items-center rounded-2xl bg-white p-4 shadow-sm">
      <Pressable onPress={() => toggleTodo(item)} className={`mr-3 h-7 w-7 items-center justify-center rounded-full border-2 ${item.completed ? 'border-green-500 bg-green-500' : 'border-slate-300'}`}>
        {item.completed && <Text className="font-bold text-white">✓</Text>}
      </Pressable>
      <Text className={`flex-1 text-base ${item.completed ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{item.title}</Text>
      <Pressable onPress={() => deleteTodo(item)} className="rounded-xl bg-red-50 px-3 py-2"><Text className="font-semibold text-red-500">Delete</Text></Pressable>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <StatusBar barStyle="dark-content" backgroundColor="#f1f5f9" />
      <View className="px-5 pt-6">
        <Text className="text-3xl font-bold text-slate-900">My Todo List</Text>
        <Text className="mt-1 text-slate-500">Simple React Native + Node.js app</Text>
        <View className="mt-4 flex-row items-center">
          <View className={`mr-2 h-2.5 w-2.5 rounded-full ${online ? 'bg-green-500' : 'bg-amber-500'}`} />
          <Text className="text-xs text-slate-500">{online ? 'Backend connected' : 'Offline mode'}</Text>
        </View>
        <View className="mt-5 flex-row">
          <TextInput value={title} onChangeText={setTitle} onSubmitEditing={addTodo} placeholder="Enter a todo..." className="mr-2 flex-1 rounded-2xl bg-white px-4 py-3 text-base text-slate-800" />
          <Pressable onPress={addTodo} className="items-center justify-center rounded-2xl bg-indigo-600 px-5"><Text className="font-bold text-white">Add</Text></Pressable>
        </View>
      </View>
      <FlatList data={todos} keyExtractor={item => String(item._id || item.id)} renderItem={renderItem} refreshing={loading} onRefresh={loadTodos} contentContainerStyle={{padding: 20, paddingBottom: 40}} ListEmptyComponent={<Text className="mt-10 text-center text-slate-400">No todos yet. Add your first one!</Text>} />
    </SafeAreaView>
  );
}
