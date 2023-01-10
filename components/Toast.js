import { View, Text } from "react-native";
import { ToastProvider } from "react-native-toast-notifications";

function Toast({ children }) {
  return (
    <ToastProvider
      renderType={{
        custom_type_ok: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "green",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),
        custom_type_ok_info: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "green",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Ordine accettato</Text>
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),
        custom_type_refund: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "blue",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),
        custom_type_refund_info: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "blue",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Ordine Rimborsato</Text>
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),
        custom_type_refund_pending_info: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "blue",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  Ordine in attesa di rimborso
                </Text>
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),
        custom_type_pending: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "yellow",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),
        custom_type_pending_info: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "yellow",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>
                  Ordine in accettazione
                </Text>
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),
        custom_type_error_info: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "red",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text style={{ fontWeight: "bold" }}>Ordine cancellato</Text>
                <Text>{toast.message}</Text>
              </View>
            </View>
          </View>
        ),

        custom_type_error: (toast) => (
          <View
            style={{
              margin: 4,
            }}
          >
            <View
              style={{
                backgroundColor: "white",
                elevation: 8,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.5,
                shadowRadius: 2,
                flexDirection: "row",
                borderRadius: 8,
              }}
            >
              <View
                style={{
                  width: "5%",
                  backgroundColor: "red",
                  height: "100%",
                  borderBottomLeftRadius: 8,
                  borderTopLeftRadius: 8,
                }}
              ></View>
              <View
                style={{
                  backgroundColor: "white",
                  padding: 15,
                }}
              >
                <Text>{toast.message === null ? null : toast.message}</Text>
              </View>
            </View>
          </View>
        ),
      }}
    >
      {children}
    </ToastProvider>
  );
}

export default Toast;
