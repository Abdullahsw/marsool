import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { theme } from '../config/theme';
import { useCities, City } from '../hooks/useCities';
import { useDeliveryCompany } from '../hooks/useDeliveryCompany';

interface Region {
  id: string;
  region_name: string;
}

interface ShippingFormProps {
  onShippingChange: (data: ShippingData) => void;
}

export interface ShippingData {
  customerName: string;
  phone1: string;
  phone2?: string;
  city?: City;
  area?: string;
  landmark: string;
  notes?: string;
}

export const ShippingForm: React.FC<ShippingFormProps> = ({ onShippingChange }) => {
  const { cities, loading } = useCities();
  const { company } = useDeliveryCompany();
  
  const [customerName, setCustomerName] = useState('');
  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');
  const [selectedCity, setSelectedCity] = useState<City | undefined>();
  const [selectedRegion, setSelectedRegion] = useState<Region | undefined>();
  const [landmark, setLandmark] = useState('');
  const [notes, setNotes] = useState('');
  
  const [cityModalVisible, setCityModalVisible] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [regionSearchQuery, setRegionSearchQuery] = useState('');
  
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionsLoading, setRegionsLoading] = useState(false);

  // Update parent whenever form changes
  React.useEffect(() => {
    onShippingChange({
      customerName,
      phone1,
      phone2,
      city: selectedCity,
      area,
      landmark,
      notes,
    });
  }, [customerName, phone1, phone2, selectedCity, area, landmark, notes]);

  const filteredCities = cities.filter((city) =>
    city.displayName.toLowerCase().includes(citySearchQuery.toLowerCase()) ||
    city.companyCityName.toLowerCase().includes(citySearchQuery.toLowerCase())
  );

  const handleSelectCity = (city: City) => {
    setSelectedCity(city);
    setCityModalVisible(false);
    setCitySearchQuery('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>معلومات العميل</Text>

      {/* Customer Name */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          اسم العميل <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل اسم العميل"
          placeholderTextColor={theme.colors.textLight}
          value={customerName}
          onChangeText={setCustomerName}
          textAlign="right"
        />
      </View>

      {/* Phone 1 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          رقم الهاتف الأول <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="07XX XXX XXXX"
          placeholderTextColor={theme.colors.textLight}
          value={phone1}
          onChangeText={setPhone1}
          keyboardType="phone-pad"
          textAlign="right"
        />
      </View>

      {/* Phone 2 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>رقم الهاتف الثاني (اختياري)</Text>
        <TextInput
          style={styles.input}
          placeholder="07XX XXX XXXX"
          placeholderTextColor={theme.colors.textLight}
          value={phone2}
          onChangeText={setPhone2}
          keyboardType="phone-pad"
          textAlign="right"
        />
      </View>

      {/* City Selection */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          المحافظة <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.selectButton}
          onPress={() => setCityModalVisible(true)}
        >
          <Ionicons name="chevron-down" size={20} color={theme.colors.textSecondary} />
          <Text
            style={[
              styles.selectButtonText,
              !selectedCity && styles.selectButtonPlaceholder,
            ]}
          >
            {selectedCity ? selectedCity.displayName : 'اختر المحافظة'}
          </Text>
        </TouchableOpacity>

        {selectedCity && (
          <Text style={styles.deliveryFeeInfo}>
            رسوم التوصيل: {selectedCity.deliveryFee.toLocaleString('ar-IQ')} د.ع
          </Text>
        )}
      </View>

      {/* Area */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>المنطقة (اختياري)</Text>
        <TextInput
          style={styles.input}
          placeholder="أدخل المنطقة"
          placeholderTextColor={theme.colors.textLight}
          value={area}
          onChangeText={setArea}
          textAlign="right"
        />
      </View>

      {/* Landmark */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>
          أقرب نقطة دالة <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          style={styles.input}
          placeholder="مثال: قرب جامع النور"
          placeholderTextColor={theme.colors.textLight}
          value={landmark}
          onChangeText={setLandmark}
          textAlign="right"
        />
      </View>

      {/* Notes */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>ملاحظات الطلب (اختياري)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="أي ملاحظات خاصة بالطلب"
          placeholderTextColor={theme.colors.textLight}
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={4}
          textAlign="right"
          textAlignVertical="top"
        />
      </View>

      {/* City Selection Modal */}
      <Modal
        visible={cityModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setCityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setCityModalVisible(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>اختر المحافظة</Text>
            </View>

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={theme.colors.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="ابحث عن المحافظة"
                placeholderTextColor={theme.colors.textLight}
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                textAlign="right"
              />
            </View>

            {/* Cities List */}
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={filteredCities}
                keyExtractor={(item) => item.companyCityId}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.cityItem}
                    onPress={() => handleSelectCity(item)}
                  >
                    <View style={styles.cityInfo}>
                      <Text style={styles.cityName}>{item.displayName}</Text>
                      <Text style={styles.cityFee}>
                        {item.deliveryFee.toLocaleString('ar-IQ')} د.ع
                      </Text>
                    </View>
                    {selectedCity?.companyCityId === item.companyCityId && (
                      <Ionicons
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>لم يتم العثور على نتائج</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  title: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.lg,
  },
  fieldContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: theme.fontSize.md,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: theme.spacing.xs,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 100,
  },
  selectButton: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
  },
  selectButtonText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    flex: 1,
    textAlign: 'right',
  },
  selectButtonPlaceholder: {
    color: theme.colors.textLight,
  },
  deliveryFeeInfo: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
    fontWeight: theme.fontWeight.medium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: theme.spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text,
  },
  searchContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    margin: theme.spacing.lg,
  },
  searchInput: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  loadingContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  cityItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundGray,
  },
  cityInfo: {
    flex: 1,
  },
  cityName: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text,
    textAlign: 'right',
    marginBottom: 4,
  },
  cityFee: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'right',
  },
  emptyContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
