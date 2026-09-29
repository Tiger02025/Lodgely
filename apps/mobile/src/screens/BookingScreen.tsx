import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useQuery, useMutation } from 'react-query';
import api from '../services/api';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { useAuth } from '../contexts/AuthContext';
import { colors, fonts } from '../theme/brand';

type BookingRouteProp = RouteProp<{ Booking: { propertyId: string } }, 'Booking'>;

interface Property {
  id: string;
  title: string;
  monthlyRent: number;
  price: number;
  images: { url: string; isPrimary: boolean }[];
}

export default function BookingScreen() {
  const route = useRoute<BookingRouteProp>();
  const navigation = useNavigation() as any;
  const { propertyId } = route.params;
  const { user } = useAuth();
  const [selectedRange, setSelectedRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null,
  });

  const { data: property, isLoading: propertyLoading } = useQuery(['property', propertyId], () =>
    api.get(`/properties/${propertyId}`).then((res) => res.data.data.property as Property),
  );

  const bookingMutation = useMutation(
    (data: any) => api.post('/bookings', data).then((res) => res.data),
    {
      onSuccess: (data) => {
        const bookingId = data.data.booking.id;
        paymentMutation.mutate({ bookingId, amount: data.data.booking.totalPrice });
      },
      onError: () => {
        Alert.alert('Error', 'Failed to create booking');
      },
    }
  );

  const paymentMutation = useMutation(
    (data: { bookingId: string; amount: number }) =>
      api.post('/payments/intent', data).then((res) => res.data),
    {
      onSuccess: async () => {
        Alert.alert('Success', 'Booking created! Proceeding to payment.');
        navigation.goBack();
      },
      onError: () => {
        Alert.alert('Error', 'Payment failed');
      },
    }
  );

  const toDateKey = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;

  const handleDateSelect = (date: Date) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
    } else {
      setSelectedRange({ start: selectedRange.start, end: date });
    }
  };

  const calculateTotal = () => {
    if (!selectedRange.start || !selectedRange.end || !property) return 0;
    const days = Math.ceil(
      (selectedRange.end.getTime() - selectedRange.start.getTime()) / (1000 * 60 * 60 * 24)
    );
    return property.monthlyRent * days;
  };

  const handleBooking = () => {
    if (!selectedRange.start || !selectedRange.end) {
      Alert.alert('Error', 'Please select check-in and check-out dates');
      return;
    }
    if (!user) {
      // Booking is only reachable while authenticated; the session simply expired.
      Alert.alert('Session Expired', 'Please log in again to book this property.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
      return;
    }
    bookingMutation.mutate({
      propertyId,
      checkInDate: selectedRange.start.toISOString(),
      checkOutDate: selectedRange.end.toISOString(),
    });
  };

  if (propertyLoading || !property) {
    return (
      <View style={styles.center}>
        <Text>Loading property...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.propertyInfo}>
        <Text style={styles.title}>{property.title}</Text>
        <Text style={styles.price}>${property.monthlyRent}/month</Text>
      </View>

      <View style={styles.datePicker}>
        <Text style={styles.label}>Select Dates</Text>
        <Calendar
          markingType="period"
          minDate={new Date()}
          onDayPress={(day: { dateString: string }) =>
            handleDateSelect(new Date(`${day.dateString}T00:00:00`))
          }
          markedDates={{
            ...(selectedRange.start
              ? {
                  [toDateKey(selectedRange.start)]: {
                    ...(selectedRange.end ? { startingDay: true, color: colors.primary } : { color: colors.primary }),
                  },
                }
              : {}),
            ...(selectedRange.start && selectedRange.end
              ? { [toDateKey(selectedRange.end)]: { color: colors.primary } }
              : {}),
          }}
        />
      </View>

      {selectedRange.start && selectedRange.end && (
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-in:</Text>
            <Text style={styles.summaryValue}>{selectedRange.start.toDateString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Check-out:</Text>
            <Text style={styles.summaryValue}>{selectedRange.end.toDateString()}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Price:</Text>
            <Text style={styles.totalPrice}>${calculateTotal().toFixed(2)}</Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, (!selectedRange.start || !selectedRange.end) && styles.buttonDisabled]}
        onPress={handleBooking}
        disabled={!selectedRange.start || !selectedRange.end || bookingMutation.isLoading}
      >
        <Text style={styles.buttonText}>
          {bookingMutation.isLoading ? 'Processing...' : 'Book Now'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  propertyInfo: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.divider },
    title: { fontFamily: fonts.regular, fontSize: 20, fontWeight: 'bold', color: colors.text },
    price: { fontFamily: fonts.regular, fontSize: 18, fontWeight: 'bold', color: colors.primary, marginTop: 4 },
  datePicker: { padding: 16, alignItems: 'center' },
    label: { fontFamily: fonts.regular, fontSize: 16, fontWeight: '600', color: colors.text, marginBottom: 12 },
  summary: { padding: 16, backgroundColor: colors.background, borderRadius: 12, margin: 16 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    summaryLabel: { fontFamily: fonts.regular, fontSize: 14, color: colors.textMuted },
    summaryValue: { fontFamily: fonts.regular, fontSize: 14, color: colors.text },
    totalPrice: { fontFamily: fonts.regular, fontSize: 16, fontWeight: 'bold', color: colors.primary },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', margin: 16 },
  buttonDisabled: { backgroundColor: colors.primarySoft },
    buttonText: { fontFamily: fonts.regular, color: colors.white, fontSize: 16, fontWeight: '600' },
});
