// 03-rn-components-style · RN 核心组件 + Flexbox 样式 demo
// 放入 Expo 项目的 App.js 即可运行（npx create-expo-app 后替换）
// 演示：View / Text / Image / ScrollView / TextInput / Pressable + StyleSheet

import { useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from 'react-native';

export default function App() {
  const [name, setName] = useState('');       // 受控输入
  const [likes, setLikes] = useState(0);

  return (
    // SafeAreaView：避开刘海/状态栏（真原生安全区）
    <SafeAreaView style={styles.safe}>
      {/* ScrollView：可滚动容器，映射到原生 UIScrollView / ScrollView */}
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* View = 布局容器，默认就是 Flexbox，且默认主轴是「竖直 column」 */}
        <View style={styles.card}>
          {/* Text 必须包裹文字，不能像 Web 那样把文字裸放在 View 里 */}
          <Text style={styles.title}>RN 核心组件 & Flexbox</Text>

          {/* Image：source 用 uri 加载网络图，需给宽高 */}
          <Image
            style={styles.avatar}
            source={{ uri: 'https://reactnative.dev/img/tiny_logo.png' }}
          />

          {/* TextInput：受控组件，value + onChangeText 双向绑定 */}
          <TextInput
            style={styles.input}
            placeholder="输入你的名字"
            value={name}
            onChangeText={setName}
          />
          <Text style={styles.hint}>你好，{name || '陌生人'} 👋</Text>

          {/* Pressable：现代替代 TouchableOpacity，可按压态 */}
          <Pressable
            style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
            onPress={() => setLikes(likes + 1)}
          >
            <Text style={styles.btnText}>👍 点赞 {likes}</Text>
          </Pressable>
        </View>

        {/* Flexbox 横向排列演示：flexDirection: 'row' */}
        <View style={styles.row}>
          <View style={[styles.box, { backgroundColor: '#1e6fd9' }]} />
          <View style={[styles.box, { backgroundColor: '#3aa30a' }]} />
          <View style={[styles.box, { backgroundColor: '#e07b00' }]} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// StyleSheet：RN 没有 CSS 文件，样式是 JS 对象；单位是无量纲的 dp，不写 px
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',   // 交叉轴居中
    // RN 阴影：iOS 用 shadow*，Android 用 elevation
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  avatar: { width: 64, height: 64, marginBottom: 16 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  hint: { color: '#666', marginBottom: 16 },
  btn: { backgroundColor: '#1e6fd9', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  btnPressed: { opacity: 0.7 },
  btnText: { color: '#fff', fontWeight: 'bold' },
  row: {
    flexDirection: 'row',       // 主轴改横向
    justifyContent: 'space-between', // 主轴分布
    marginTop: 16,
  },
  box: { width: 90, height: 90, borderRadius: 8 },
});
