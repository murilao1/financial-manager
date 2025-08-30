import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, IconButton, Icon, useTheme } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';
import Button from '@/designSystem/Button';

type FileData = {
  uri: string;
  name: string;
  size?: number;
  type?: string;
};

type UploadFieldProps = {
  onChange: (file: FileData) => void;
  fileType?: '*/*' | 'image/*' | 'application/pdf' | string;
};

export default function UploadField({
                                      onChange,
                                      fileType = '*/*',
                                    }: UploadFieldProps) {
  const [file, setFile] = useState<FileData | null>(null);
  const theme = useTheme();

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: fileType });
    if (result.canceled === false) {
      const resultData = result?.assets?.[0];
      const fileData: FileData = {
        uri: resultData.uri,
        name: resultData.name,
        size: resultData.size,
        type: resultData.mimeType,
      };
      setFile(fileData);
      onChange(fileData);
    }
  };

  const removeFile = () => {
    setFile(null);
    onChange(null);
  };

  const renderPreview = () => {
    if (!file) return null;
    const isImage = file.type.match(/\/(jpg|jpeg|png|gif)$/i);
    return (
      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} mode="elevated">
        <Card.Title
          subtitle={file.name}
          center={file.name}
          left={(props) => (
            <>
              {isImage ? (
                <Image {...props} source={{ uri: file.uri }} style={styles.previewImage} />
              ) : (
                <Icon source="file-document-outline" size={40} />
              )}
            </>
          )}
          right={(props) => (
            <IconButton {...props} icon="trash-can-outline" onPress={removeFile} />
          )}
        />
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      {!file ? (
        <View style={styles.labelRow}>
          <Button icon="upload" mode="text" onPress={pickFile} contentStyle={styles.button}>
            Selecionar um arquivo
          </Button>
        </View>
      ) : (
        <>{renderPreview()}</>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
  },
  button: {
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  previewImage: {
    width: 45,
    height: 45,
    borderRadius: 8,
  },
  card: {
    padding: 5,
  },
});
