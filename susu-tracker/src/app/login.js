import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import Input from "../components/input";
import Frame from "../../assets/icons/Frame.svg";
import Lock from "../../assets/icons/Lock.svg";
import Splash from "../../assets/splash.svg";
import a from "../styles/globalStyles";
import { colors } from "../styles/theme";
import supabase from "../lib/supabase";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    if (!password) {
      setFormError("Please enter your password.");
      return;
    }

    setEmailError("");
    setFormError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });
      if (error) setFormError(error.message);
    } catch (err) {
      setFormError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={a.screen}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[
              a.body,
              { flexGrow: 1, justifyContent: "center" },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[a.center, { gap: 8 }]}>
              <Splash width={120} height={120} />
              <Text style={a.title}>Susu Tracker</Text>
              <Text style={a.muted}>Track every payment. Forget no one.</Text>
            </View>

            <Input
              icon={<Frame width={20} height={20} />}
              placeholder="Admin Email"
              secure={false}
              type="email-address"
              value={email}
              error={emailError}
              action={(text) => {
                setEmail(text);
                if (emailError) setEmailError("");
              }}
            />

            <Input
              icon={<Lock width={20} height={20} />}
              placeholder="Password"
              secure={true}
              type="default"
              value={password}
              action={(text) => {
                setPassword(text);
                if (formError) setFormError("");
              }}
            />

            {formError ? (
              <Text style={[a.muted, a.unpaidText]}>{formError}</Text>
            ) : null}

            <TouchableOpacity
              style={[a.btn, a.btnPrimary, loading && a.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.textOnDark} />
              ) : (
                <Text style={[a.btnLabel, a.btnLabelPrimary]}>SIGN IN</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
