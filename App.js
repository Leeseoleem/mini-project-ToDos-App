import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme, theme_light } from "./colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import Fontisto from "@expo/vector-icons/Fontisto";
import Ionicons from "@expo/vector-icons/Ionicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "@toDos";

export default function App() {
  // App 실행 시 storage에 저장한 todo 내용을 불러옴
  useEffect(() => {
    setFooterM(false);
    loadToDos();
  }, []);

  // 어떤 menu를 선택했는지 여부를 저장
  const [touch, setTouch] = useState(true);
  // user가 TextInput에 작성한 내용
  const [text, setText] = useState("");
  // 작성한 내용을 저장하는 Object
  const [toDos, setTodos] = useState({});
  // footerMenu 를 띄우는 Object
  const [footerM, setFooterM] = useState(false);
  // 수정을 위한 TextInput에 작성한 내용
  const [editText, setEditText] = useState("");
  // 색상 mode 변경을 위한 state
  const [lightMode, setLightMode] = useState(false);
  const colorMode = {
    black: !lightMode ? theme.black : theme_light.black_mode,
    white: !lightMode ? theme.white : theme_light.white_mode,
    grey: !lightMode ? theme.grey : theme_light.grey_mode,
    grey_D: !lightMode ? theme.dark_grey : theme_light.dark_grey_mode,
    grey_L: !lightMode ? theme.light_grey : theme_light.light_grey_mode,
  };

  // storage에 toDos를 저장하는 함수
  const saveToDos = async (toSave) => {
    // toSvae: 변경된 내용의 newToDos 값을 받음
    // newToDos -> Object 형식이므로 Sting으로 변환 필요
    const toDos_s = JSON.stringify(toSave);

    await AsyncStorage.setItem(STORAGE_KEY, toDos_s);
  };

  // storage에 저장한 toDos 내용을 불러오는 함수
  const loadToDos = async () => {
    const load_todos = await AsyncStorage.getItem(STORAGE_KEY);
    const parsedToDos = load_todos ? JSON.parse(load_todos) : {}; // Null 체크 추가
    setTodos(parsedToDos); // JSON.parse: String => Object 변환
  };
  const travelBtn = () => {
    setTouch(false);
  };
  const workBtn = () => {
    setTouch(true);
  };

  const checkBtn = async (id) => {
    const newToDos = { ...toDos };
    if (newToDos[id].check) {
      newToDos[id].check = false;
    } else {
      newToDos[id].check = true;
    }
    setTodos(newToDos); // state에 저장
    await saveToDos(newToDos); // storage에 저장
  };
  // text로 작성한 내용을 감지
  const onChangeText = (e) => {
    setText(e);
  };

  const onChangeEditText = (e) => {
    setEditText(e);
  };

  const addTodo = async () => {
    // text에 작성한 내용이 없다면 아무것도 반환하지 않음
    if (text === "") {
      return;
    }
    // 작성한 내용을 업데이트 하는 Object 변수
    const newToDos = {
      [Date.now()]: {
        text,
        touch,
        check: false,
        edit: false,
      },
      ...toDos,
    };
    setTodos(newToDos); // state에 저장
    await saveToDos(newToDos); // storage에 저장
    setText("");
  };

  const deleteToDo = async (id) => {
    Alert.alert(`"${toDos[id].text}" 삭제`, "정말 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      // text에 작성한 내용이 있는 경우 => 저장
      {
        text: "확인",
        onPress: async () => {
          const newToDos = { ...toDos };
          console.log(newToDos[id]);
          delete newToDos[id];
          setTodos(newToDos); // state에 저장
          await saveToDos(newToDos); // storage에 저장
        },
      },
    ]);
  };

  const deleteAll = () => {
    setFooterM(false);
    Alert.alert("전체 삭제", "정말 삭제하시겠습니까?", [
      {
        text: "취소",
        style: "cancel",
      },
      {
        text: "확인",
        style: "destructive",
        onPress: async () => {
          const editTDos = { ...toDos };
          if (touch) {
            console.log("Mode Work!");
            for (const id in editTDos) {
              if (editTDos[id].touch) {
                delete editTDos[id];
              }
            }
          } else {
            console.log("mode Travel!");
            for (const id in editTDos) {
              if (!editTDos[id].touch) {
                delete editTDos[id];
              }
            }
          }
          setTodos(editTDos);
          await saveToDos(editTDos);
        },
      },
    ]);
  };

  const editToDo = async (id) => {
    const newToDos = { ...toDos };
    newToDos[id].text = editText;
    setTodos(newToDos); // state에 저장
    await saveToDos(newToDos); // storage에 저장
  };

  return (
    <View style={{ ...styles.container, backgroundColor: colorMode.black }}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={workBtn}>
          <Text
            style={{
              ...styles.btnText,
              color: touch ? colorMode.white : colorMode.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travelBtn}>
          <Text
            style={{
              ...styles.btnText,
              color: !touch ? colorMode.white : colorMode.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          paddingHorizontal: 24,
        }}
      >
        <View>
          <TextInput
            style={{
              ...styles.input,
              borderColor: colorMode ? theme_light.grey_mode : null,
              borderWidth: colorMode ? 1 : null,
            }}
            placeholder={
              touch ? "할 일은 무엇입니까?" : "어디에 가고 싶습니까?"
            }
            returnKeyLabel="완료"
            // TextInput에 작성한 내용
            value={text}
            // text가 변화하는 내용을 감지
            onChangeText={onChangeText}
            onSubmitEditing={addTodo}
          />
        </View>
        <View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 8,
              marginBottom: 24,
            }}
          >
            <Text style={{ ...styles.todoLogo, color: colorMode.white }}>
              {touch ? "Work List" : "Travle List"}
            </Text>
            <View
              style={{
                marginHorizontal: 8,
                flex: 1,
                height: 2,
                backgroundColor: colorMode.white,
              }}
            ></View>
          </View>

          <ScrollView>
            {Object.keys(toDos).map((todo_id) =>
              toDos[todo_id].touch === touch ? (
                <View
                  style={
                    !toDos[todo_id].check
                      ? { ...styles.toDo, backgroundColor: colorMode.grey }
                      : { ...styles.toDo_c, backgroundColor: colorMode.grey_D }
                  }
                  key={todo_id}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignContent: "center",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => {
                        checkBtn(todo_id);
                      }}
                    >
                      {!toDos[todo_id].edit ? (
                        !toDos[todo_id].check ? (
                          <Fontisto
                            name="checkbox-passive"
                            size={14}
                            color={colorMode.grey_L}
                            style={{
                              marginRight: 8,
                              paddingTop: 4,
                            }}
                          />
                        ) : (
                          <Fontisto
                            name="checkbox-active"
                            size={14}
                            color={colorMode.grey}
                            style={{
                              marginRight: 6.5,
                              paddingTop: 4,
                            }}
                          />
                        )
                      ) : null}
                    </TouchableOpacity>
                    {!toDos[todo_id].edit ? (
                      <Text
                        style={
                          !toDos[todo_id].check
                            ? { ...styles.toDoText, color: colorMode.grey_L }
                            : {
                                ...styles.toDoText_c,
                                color: colorMode.grey,
                              }
                        }
                      >
                        {toDos[todo_id].text}
                      </Text>
                    ) : (
                      <TextInput
                        autoFocus={true}
                        value={editText}
                        onChangeText={onChangeEditText}
                        onSubmitEditing={() => {
                          toDos[todo_id].edit = false;
                          editToDo(todo_id);
                        }}
                      ></TextInput>
                    )}
                  </View>
                  {!toDos[todo_id].edit ? (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          toDos[todo_id].edit = true;
                          setEditText(toDos[todo_id].text);
                        }}
                      >
                        <AntDesign
                          name="edit"
                          size={18}
                          color={
                            !toDos[todo_id].check
                              ? colorMode.black
                              : colorMode.grey
                          }
                          style={{ marginHorizontal: 16 }}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          deleteToDo(todo_id);
                        }}
                      >
                        <MaterialIcons
                          name="delete"
                          size={18}
                          color={
                            !toDos[todo_id].check
                              ? colorMode.black
                              : colorMode.grey
                          }
                        />
                      </TouchableOpacity>
                    </View>
                  ) : null}
                </View>
              ) : null
            )}
          </ScrollView>
        </View>
      </View>
      {footerM ? (
        <View style={styles.footerMenu}>
          <TouchableOpacity style={styles.fmText} onPress={deleteAll}>
            <AntDesign name="closecircle" size={16} color="#222" />
            <Text
              style={{
                fontWeight: "600",
              }}
            >
              전체 삭제
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={{ ...styles.footer, backgroundColor: colorMode.white }}>
        <TouchableOpacity
          onPress={() => {
            setLightMode(!lightMode);
          }}
        >
          <FontAwesome5
            name="lightbulb"
            size={24}
            color={colorMode.black}
            style={styles.lightBtn}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setFooterM(!footerM);
          }}
        >
          <Ionicons
            name="ellipsis-vertical-sharp"
            size={24}
            color={colorMode.black}
            style={styles.lightBtn}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingHorizontal: 가로 방향으로 padding 부여
  },
  header: {
    paddingHorizontal: 24,
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 80,
  },
  btnText: {
    fontSize: 36,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#fff",
    height: 56,
    borderRadius: 24,
    fontSize: 12,
    paddingHorizontal: 16,
    marginVertical: 24,
  },
  todoLogo: {
    fontSize: 24,
    fontWeight: "500",
    textAlign: "center",
  },

  toDo: {
    marginBottom: 8,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDo_c: {
    marginBottom: 8,
    height: 48,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toDoText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toDoText_c: {
    textDecorationLine: "line-through",
    fontStyle: "italic",
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    width: "100%",
    height: 56,
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    bottom: 0,
  },
  lightBtn: {
    marginHorizontal: 24,
  },
  footerMenu: {
    width: 112,
    height: 52,
    position: "absolute",
    bottom: 64,
    right: 0,
    borderRadius: 24,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    justifyContent: "center",
    borderColor: theme.grey,
    borderWidth: 1,
  },
  fmText: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
});
