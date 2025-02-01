import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Stack } from "expo-router";
import { useAuth } from "../../utils/auth";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";

WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { signIn } = useAuth();

  const [_, googleResponse, googleSignIn] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });

  const handleEmailSignIn = async () => {
    try {
      await signIn({ email, password });
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await googleSignIn();
      if (result?.type === "success") {
        const { authentication } = result;
        // Handle the Google authentication result
        await signIn({ 
          provider: "google",
          token: authentication?.accessToken,
        });
      }
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Sign In" }} />
      
      <Text style={styles.title}>Sign in to your account</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleEmailSignIn}>
        <Text style={styles.buttonText}>Sign in</Text>
      </TouchableOpacity>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity 
        style={[styles.button, styles.googleButton]} 
        onPress={handleGoogleSignIn}
      >
        <Text style={[styles.buttonText, styles.googleButtonText]}>
          Sign in with Google
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.signupLink}>
        <Text style={styles.signupText}>
          Don't have an account?{" "}
          <Text style={styles.signupLinkText}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  dividerText: {
    marginHorizontal: 8,
    color: "#64748b",
  },
  googleButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  googleButtonText: {
    color: "#000",
  },
  signupLink: {
    marginTop: 24,
    alignItems: "center",
  },
  signupText: {
    color: "#64748b",
    fontSize: 14,
  },
  signupLinkText: {
    color: "#2563eb",
    fontWeight: "600",
  },
}); 