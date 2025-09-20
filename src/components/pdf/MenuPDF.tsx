import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { MenuPDFData } from './menuTypes';

// Estilos para o PDF de cardápio
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: 1,
    borderBottomColor: '#000000',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  infoLabel: {
    fontWeight: 'bold',
    width: '30%',
  },
  infoValue: {
    width: '70%',
  },
  table: {
    marginTop: 10,
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#667eea',
    padding: 8,
    fontWeight: 'bold',
    fontSize: 9,
    color: 'white',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 5,
    borderBottom: 1,
    borderBottomColor: '#e0e0e0',
    fontSize: 8,
  },
  tableRowEven: {
    backgroundColor: '#f8f9fa',
  },
  tableCell: {
    flex: 1,
    textAlign: 'left',
  },
  tableCellCenter: {
    flex: 1,
    textAlign: 'center',
  },
  tableCellRight: {
    flex: 1,
    textAlign: 'right',
  },
  summarySection: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#f0f8ff',
    borderRadius: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  summaryLabel: {
    fontWeight: 'bold',
    fontSize: 9,
  },
  summaryValue: {
    fontSize: 9,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTop: 1,
    borderTopColor: '#000000',
    fontWeight: 'bold',
  },
  unitarySection: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e8f5e8',
    borderRadius: 5,
  },
  unitaryTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#2e7d32',
  },
  menuBadge: {
    backgroundColor: '#667eea',
    color: 'white',
    padding: 5,
    borderRadius: 3,
    fontSize: 8,
    textAlign: 'center',
    marginBottom: 10,
  },
});

interface MenuPDFPageProps {
  data: MenuPDFData;
}

const MenuPDFPage: React.FC<MenuPDFPageProps> = ({ data }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <Page size="A4" style={styles.page}>
      {/* Badge de identificação */}
      <View style={styles.menuBadge}>
        <Text>CARDÁPIO</Text>
      </View>

      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={styles.title}>{data.name.toUpperCase()}</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Rendimento:</Text>
          <Text style={styles.infoValue}>{data.yield}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Descrição:</Text>
          <Text style={styles.infoValue}>{data.description}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Data:</Text>
          <Text style={styles.infoValue}>{data.date}</Text>
        </View>
      </View>

      {/* Tabela de itens do cardápio */}
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={[styles.tableCell, { flex: 3 }]}>Itens do Cardápio</Text>
          <Text style={styles.tableCellCenter}>Quantidade</Text>
          <Text style={styles.tableCellRight}>Custo</Text>
          <Text style={styles.tableCellRight}>Venda</Text>
          <Text style={styles.tableCellRight}>Lucro</Text>
        </View>

        {data.items.map((item, index) => (
          <View key={index} style={[styles.tableRow, index % 2 === 0 ? styles.tableRowEven : {}]}>
            <Text style={[styles.tableCell, { flex: 3 }]}>{item.name.toUpperCase()}</Text>
            <Text style={styles.tableCellCenter}>{item.quantity}</Text>
            <Text style={styles.tableCellRight}>{formatCurrency(item.cost)}</Text>
            <Text style={styles.tableCellRight}>{formatCurrency(item.selling)}</Text>
            <Text style={styles.tableCellRight}>{formatCurrency(item.profit)}</Text>
          </View>
        ))}
      </View>

      {/* Resumo Financeiro - Total */}
      <View style={styles.summarySection}>
        <Text style={styles.subtitle}>RESUMO TOTAL DO CARDÁPIO</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Custo total</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.totalCost)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Preço de venda</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.sellingPrice)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text>LUCRO</Text>
          <Text>
            {formatCurrency(data.profit)} {formatPercentage(data.profitPercentage)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>CMV</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(data.cmv)} {formatPercentage(data.cmvPercentage)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>CUSTOS DIR.</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(data.directCosts)} {formatPercentage(data.directCostsPercentage)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>CUSTOS INDIR.</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(data.indirectCosts)} {formatPercentage(data.indirectCostsPercentage)}
          </Text>
        </View>
      </View>

      {/* Resumo Financeiro - Por Porção */}
      <View style={styles.unitarySection}>
        <Text style={styles.unitaryTitle}>VALORES POR PORÇÃO</Text>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Custo por porção</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.unitCost)}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Preço de venda</Text>
          <Text style={styles.summaryValue}>{formatCurrency(data.unitSellingPrice)}</Text>
        </View>

        <View style={styles.totalRow}>
          <Text>LUCRO</Text>
          <Text>
            {formatCurrency(data.unitProfit)} {formatPercentage(data.unitProfitPercentage)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>CMV</Text>
          <Text style={styles.summaryValue}>
            {formatCurrency(data.unitCost)} {formatPercentage(100 - data.unitProfitPercentage)}
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>CUSTOS DIR.</Text>
          <Text style={styles.summaryValue}>{formatCurrency(0)} 0%</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>CUSTOS INDIR.</Text>
          <Text style={styles.summaryValue}>{formatCurrency(0)} 0%</Text>
        </View>
      </View>
    </Page>
  );
};

export const MenuPDF: React.FC<MenuPDFPageProps> = ({ data }) => {
  return (
    <Document>
      <MenuPDFPage data={data} />
    </Document>
  );
};
