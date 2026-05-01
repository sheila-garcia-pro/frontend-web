import React from 'react';
import { Document, DocumentProps, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

export interface RecipePDFData {
  name: string;
  category: string;
  description: string;
  preparationTime: string;
  yieldText: string;
  weightText: string;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 24,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1f2933',
  },
  header: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: 1,
    borderBottomColor: '#e6e6e6',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: '#5f6b76',
  },
  section: {
    marginTop: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: '35%',
  },
  infoValue: {
    width: '65%',
  },
  description: {
    marginTop: 6,
    lineHeight: 1.4,
  },
});

interface RecipePDFProps {
  data: RecipePDFData;
}

export const buildRecipePDFDocument = (
  data: RecipePDFData,
): React.ReactElement<DocumentProps> => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>{data.name.toUpperCase()}</Text>
        <Text style={styles.subtitle}>Categoria: {data.category || '-'}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tempo de preparo:</Text>
          <Text style={styles.infoValue}>{data.preparationTime || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rendimento:</Text>
          <Text style={styles.infoValue}>{data.yieldText || '-'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Peso total:</Text>
          <Text style={styles.infoValue}>{data.weightText || '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.infoLabel}>Descricao</Text>
        <Text style={styles.description}>{data.description || '-'}</Text>
      </View>
    </Page>
  </Document>
);

export const RecipePDF: React.FC<RecipePDFProps> = ({ data }) => buildRecipePDFDocument(data);
