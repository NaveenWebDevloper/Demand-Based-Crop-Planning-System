import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Alert, 
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import api from '../api/config';
import { Calculator, ChevronLeft, CreditCard, User, Gavel, Truck, Coins, ArrowRight, Info } from 'lucide-react-native';
import { THEME } from '../styles/theme';

const { width } = Dimensions.get('window');

const RevenueEstimatorScreen = ({ navigation, route }) => {
  const [demands, setDemands] = useState([]);
  const [selectedDemand, setSelectedDemand] = useState(null);
  const [form, setForm] = useState({
    demandId: route.params?.demandId || '',
    plannedQuantity: '',
    landArea: '',
    landAreaUnit: 'acre',
    seeds: '',
    fertilizers: '',
    pesticides: '',
    labor: '',
    irrigation: '',
    machinery: '',
    transportation: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cultivationCost, setCultivationCost] = useState(null);
  const [estimate, setEstimate] = useState(null);

  useEffect(() => {
    fetchDemands();
  }, []);

  const fetchDemands = async () => {
    try {
      const res = await api.get('/api/market/demand');
      const data = res.data.demands || [];
      setDemands(data);
      if (form.demandId) {
        setSelectedDemand(data.find(d => d._id === form.demandId));
      } else if (data.length > 0) {
        setForm(prev => ({ ...prev, demandId: data[0]._id }));
        setSelectedDemand(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCosts = async () => {
    if (!form.landArea) return Alert.alert('Error', 'Land area is required');
    setSubmitting(true);
    try {
      const payload = {
        landArea: Number(form.landArea),
        landAreaUnit: form.landAreaUnit,
        seeds: Number(form.seeds || 0),
        fertilizers: Number(form.fertilizers || 0),
        pesticides: Number(form.pesticides || 0),
        labor: Number(form.labor || 0),
        irrigation: Number(form.irrigation || 0),
        machinery: Number(form.machinery || 0),
        transportation: Number(form.transportation || 0),
      };
      const res = await api.post('/api/market/revenue-estimate/cultivation-cost', payload);
      setCultivationCost(res.data.cultivationCost);
    } catch (error) {
      Alert.alert('Error', 'Failed to calculate costs');
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerate = async () => {
    if (!cultivationCost) {
      calculateCosts();
      return;
    }
    if (!form.plannedQuantity) return Alert.alert('Error', 'Planned quantity is required');
    
    setSubmitting(true);
    try {
      const res = await api.post('/api/market/revenue-estimate/save', {
        ...form,
        plannedQuantity: Number(form.plannedQuantity),
        landArea: Number(form.landArea),
        seeds: Number(form.seeds || 0),
        fertilizers: Number(form.fertilizers || 0),
        pesticides: Number(form.pesticides || 0),
        labor: Number(form.labor || 0),
        irrigation: Number(form.irrigation || 0),
        machinery: Number(form.machinery || 0),
        transportation: Number(form.transportation || 0),
      });
      setEstimate(res.data.estimate);
      Alert.alert('Success', 'Profit estimation complete!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save estimate');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <View style={styles.centered}><ActivityIndicator color={THEME.colors.primary} size="large" /></View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={THEME.colors.bgGradient} style={styles.flex}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronLeft size={24} color={THEME.colors.title} />
          </TouchableOpacity>
          <View>
            <Text style={styles.headerTitle}>Profit Estimator</Text>
            <Text style={styles.headerSubtitle}>Calculate ROI before you plant</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          {/* Section 1: Demand Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Select Reference Demand</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.demandPicker}>
              {demands.map(d => (
                <TouchableOpacity 
                  key={d._id} 
                  style={[styles.demandItem, form.demandId === d._id && styles.demandItemActive]}
                  onPress={() => {
                    setForm({...form, demandId: d._id});
                    setSelectedDemand(d);
                    setEstimate(null);
                    setCultivationCost(null);
                  }}
                >
                  <Text style={[styles.demandText, form.demandId === d._id && styles.demandTextActive]}>{d.crop}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Form Card */}
          <View style={styles.cardContainer}>
            <BlurView intensity={50} tint="light" style={styles.glassForm}>
              
              <View style={styles.inputRow}>
                <View style={[styles.inputGroup, { flex: 1.2 }]}>
                  <Text style={styles.inputLabel}>Planned Quantity ({selectedDemand?.quantityUnit || 'kg'})</Text>
                  <TextInput 
                    style={styles.input} 
                    keyboardType="numeric" 
                    placeholder="500" 
                    value={form.plannedQuantity}
                    onChangeText={v => setForm({...form, plannedQuantity: v})}
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.inputLabel}>Land Area</Text>
                  <TextInput 
                    style={styles.input} 
                    keyboardType="numeric" 
                    placeholder="2.5" 
                    value={form.landArea}
                    onChangeText={v => setForm({...form, landArea: v})}
                  />
                </View>
              </View>

              <Text style={styles.subHeader}>Estimated Cultivation Costs (₹)</Text>
              
              <View style={styles.costGrid}>
                {[
                  { label: 'Seeds', key: 'seeds', icon: <Coins size={14} color={THEME.colors.primary} /> },
                  { label: 'Fertilizer', key: 'fertilizers', icon: <CreditCard size={14} color={THEME.colors.primary} /> },
                  { label: 'Labor', key: 'labor', icon: <User size={14} color={THEME.colors.primary} /> },
                  { label: 'Trucks', key: 'transportation', icon: <Truck size={14} color={THEME.colors.primary} /> }
                ].map(cost => (
                  <View key={cost.key} style={styles.costItem}>
                    <View style={styles.costLabelRow}>
                      {cost.icon}
                      <Text style={styles.costLabel}>{cost.label}</Text>
                    </View>
                    <TextInput 
                      style={styles.costInput}
                      keyboardType="numeric"
                      placeholder="0"
                      value={form[cost.key]}
                      onChangeText={val => {
                        setForm({...form, [cost.key]: val});
                        setCultivationCost(null);
                      }}
                    />
                  </View>
                ))}
              </View>

              <TouchableOpacity 
                style={[styles.mainBtn, { backgroundColor: cultivationCost ? '#065F46' : THEME.colors.primary }]} 
                onPress={handleGenerate}
                disabled={submitting}
              >
                {submitting ? <ActivityIndicator color="white" /> : (
                  <>
                    <Text style={styles.mainBtnText}>{cultivationCost ? "Save Full Estimation" : "Calculate My ROI"}</Text>
                    <ArrowRight size={20} color="white" />
                  </>
                )}
              </TouchableOpacity>
              
              <View style={styles.glassHighlight} />
            </BlurView>
          </View>

          {/* Results Modal/Card (Matching website output) */}
          {estimate && (
            <LinearGradient colors={['#065F46', '#064E3B']} style={styles.estimateResult}>
              <View style={styles.resHeader}>
                <Info size={16} color="rgba(255,255,255,0.7)" />
                <Text style={styles.resHeaderText}>PROJECTION SUMMARY FOR {selectedDemand?.crop?.toUpperCase()}</Text>
              </View>
              
              <View style={styles.resContent}>
                <View style={styles.resCol}>
                  <Text style={styles.resLabel}>Expected Revenue</Text>
                  <Text style={styles.resValue}>₹{estimate.expectedRevenue}</Text>
                </View>
                <View style={styles.vDivider} />
                <View style={styles.resCol}>
                  <Text style={styles.resLabel}>Estimated Profit</Text>
                  <Text style={[styles.resValue, { color: '#34D399' }]}>₹{estimate.estimatedProfit}</Text>
                </View>
              </View>

              <View style={styles.hDivider} />
              <View style={styles.resFooter}>
                <Text style={styles.resFooterText}>Potential Return on Investment: </Text>
                <Text style={styles.roiText}>{Math.round((estimate.estimatedProfit / (estimate.expectedRevenue - estimate.estimatedProfit)) * 100)}%</Text>
              </View>
            </LinearGradient>
          )}

          <View style={{ height: 120 }} />
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { 
    paddingHorizontal: Platform.OS === 'ios' ? 25 : 0, 
    paddingTop: Platform.OS === 'android' ? 60 : 15, 
    paddingBottom: 15, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: 'white' 
  },
  backBtn: { width: 44, height: 44, borderRadius: 14, backgroundColor: '#F8FAFC', justifyContent: 'center', alignItems: 'center', marginRight: 15, marginLeft: 25 },
  headerTitle: { fontSize: 22, fontWeight: '900', color: THEME.colors.title },
  headerSubtitle: { fontSize: 13, color: THEME.colors.body, marginTop: 2 },
  
  scrollContent: { padding: 25 },
  section: { marginBottom: 25 },
  sectionLabel: { fontSize: 13, fontWeight: '800', color: '#94A3B8', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 0.5 },
  demandPicker: { gap: 10, paddingRight: 20 },
  demandItem: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14, backgroundColor: 'white', borderWidth: 1, borderColor: '#F1F5F9' },
  demandItemActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  demandText: { fontSize: 14, fontWeight: '700', color: THEME.colors.subtitle },
  demandTextActive: { color: 'white' },
  
  cardContainer: { marginBottom: 25 },
  glassForm: { borderRadius: 32, padding: 25, backgroundColor: 'rgba(255,255,255,0.4)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.5)', overflow: 'hidden' },
  glassHighlight: { position: 'absolute', top: 0, left: '10%', right: '10%', height: '40%', backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 100, pointerEvents: 'none' },
  
  inputRow: { flexDirection: 'row', gap: 15, marginBottom: 25 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 11, fontWeight: '800', color: '#64748B' },
  input: { backgroundColor: 'white', borderRadius: 16, paddingHorizontal: 15, paddingVertical: 14, fontSize: 16, fontWeight: '700', borderWidth: 1, borderColor: '#F1F5F9' },
  
  subHeader: { fontSize: 16, fontWeight: '800', color: THEME.colors.title, marginBottom: 15 },
  costGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 25 },
  costItem: { width: '47.5%', backgroundColor: 'white', padding: 12, borderRadius: 18, borderWidth: 1, borderColor: '#F1F5F9' },
  costLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  costLabel: { fontSize: 11, fontWeight: '700', color: '#94A3B8' },
  costInput: { fontSize: 18, fontWeight: '800', color: THEME.colors.title, padding: 0 },
  
  mainBtn: { paddingVertical: 18, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, shadowColor: THEME.colors.primary, shadowOpacity: 0.3, shadowRadius: 15, elevation: 8 },
  mainBtnText: { color: 'white', fontSize: 17, fontWeight: '800' },
  
  estimateResult: { borderRadius: 32, padding: 25, shadowColor: '#065F46', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12 },
  resHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  resHeaderText: { fontSize: 10, fontWeight: '800', color: 'rgba(255,255,255,0.7)', letterSpacing: 1 },
  resContent: { flexDirection: 'row', alignItems: 'center' },
  resCol: { flex: 1 },
  resLabel: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 4 },
  resValue: { fontSize: 22, fontWeight: '900', color: 'white' },
  vDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.1)', marginHorizontal: 20 },
  hDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 20 },
  resFooter: { flexDirection: 'row', alignItems: 'center' },
  resFooterText: { fontSize: 12, color: 'rgba(255,255,255,0.6)' },
  roiText: { fontSize: 16, fontWeight: '800', color: '#34D399' }
});

export default RevenueEstimatorScreen;
