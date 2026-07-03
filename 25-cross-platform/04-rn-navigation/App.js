// 04-rn-navigation · React Navigation 原生栈导航 demo
// 依赖（Expo 项目里安装）：
//   npx expo install @react-navigation/native @react-navigation/native-stack \
//       react-native-screens react-native-safe-area-context
// 放入 App.js 即可运行。演示：NavigationContainer + 原生栈 + 传参 + 编程式跳转

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, Button, FlatList, Pressable, StyleSheet } from 'react-native';

const Stack = createNativeStackNavigator();  // 创建原生栈导航器

// 首页：一个用户列表，点击进入详情并传参
function HomeScreen({ navigation }) {
  const users = [
    { id: '1', name: '张三' },
    { id: '2', name: '李四' },
    { id: '3', name: '王五' },
  ];
  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>用户列表</Text>
      <FlatList
        data={users}
        keyExtractor={(u) => u.id}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            // navigate('目标路由名', 参数对象)
            onPress={() => navigation.navigate('Detail', { id: item.id, name: item.name })}
          >
            <Text style={styles.itemText}>{item.name} ›</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

// 详情页：用 route.params 读取传入参数
function DetailScreen({ route, navigation }) {
  const { id, name } = route.params;  // 接收上一页传来的参数
  return (
    <View style={styles.screen}>
      <Text style={styles.h1}>{name} 的详情</Text>
      <Text style={styles.p}>用户 ID：{id}</Text>
      {/* 编程式返回 */}
      <Button title="返回列表" onPress={() => navigation.goBack()} />
    </View>
  );
}

export default function App() {
  return (
    // NavigationContainer：整个导航树的根容器，必须包在最外层
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        {/* 每个 Screen 是一个路由，name 是路由名，component 是页面 */}
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: '首页' }} />
        <Stack.Screen name="Detail" component={DetailScreen} options={{ title: '详情' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: '#fff' },
  h1: { fontSize: 22, fontWeight: 'bold', marginBottom: 16 },
  p: { fontSize: 16, marginBottom: 20, color: '#444' },
  item: { paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#eee' },
  itemText: { fontSize: 18 },
});
