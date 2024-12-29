import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, useTheme, List, Divider } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPENAI_API_KEY_STORAGE_KEY = 'openai_api_key';

export default function SettingsTab() {
  const theme = useTheme();
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadApiKey();
  }, []);

  const loadApiKey = async () => {
    try {
      const savedKey = await AsyncStorage.getItem(OPENAI_API_KEY_STORAGE_KEY);
      if (savedKey) {
        setApiKey(savedKey);
      }
    } catch (error) {
      console.error('Error loading API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveApiKey = async () => {
    setIsSaving(true);
    try {
      await AsyncStorage.setItem(OPENAI_API_KEY_STORAGE_KEY, apiKey.trim());
      // You might want to add some validation here
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1 }}>
      <Card style={{ margin: 16 }}>
        <Card.Title title="OpenAI Configuration" />
        <Card.Content>
          <Text variant="bodyMedium" style={{ marginBottom: 16, color: theme.colors.onSurfaceVariant }}>
            To use the food analysis feature, you need to provide your OpenAI API key.
            This key will be stored securely on your device.
          </Text>

          <TextInput
            mode="outlined"
            label="OpenAI API Key"
            value={apiKey}
            onChangeText={setApiKey}
            placeholder="sk-..."
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={{ marginBottom: 16 }}
          />

          <Button
            mode="contained"
            onPress={handleSaveApiKey}
            loading={isSaving}
            disabled={isSaving || !apiKey.trim()}
          >
            Save API Key
          </Button>

          <Text
            variant="bodySmall"
            style={{ marginTop: 8, color: theme.colors.onSurfaceVariant }}
          >
            Your API key is stored locally and is never shared with anyone.
          </Text>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Subheader>About</List.Subheader>
        <List.Item
          title="Version"
          description="1.0.0"
          left={props => <List.Icon {...props} icon="information" />}
        />
        <Divider />
        <List.Item
          title="Privacy Policy"
          left={props => <List.Icon {...props} icon="shield-account" />}
          onPress={() => {/* Add privacy policy link */}}
        />
        <Divider />
        <List.Item
          title="Terms of Service"
          left={props => <List.Icon {...props} icon="file-document" />}
          onPress={() => {/* Add terms of service link */}}
        />
      </List.Section>
    </ScrollView>
  );
}
