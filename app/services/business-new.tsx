import { router } from 'expo-router';
import { useState } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { ChipSelect } from '@/components/ChipSelect';
import { Input } from '@/components/Input';
import { Screen } from '@/components/Screen';
import { StepHeader } from '@/components/StepHeader';
import { useToast } from '@/components/Toast';
import { ErrorText, Fine } from '@/components/Typography';
import { addBusiness } from '@/lib/api';
import { businessCategories, FOOD_CATEGORIES } from '@/lib/categories';

export default function NewBusiness() {
  const toast = useToast();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [fssai, setFssai] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isFood = !!category && FOOD_CATEGORIES.includes(category);

  async function submit() {
    if (name.trim().length < 2) return setError('Enter your business name.');
    if (!category) return setError('Pick a category.');
    if (isFood && !/^\d{14}$/.test(fssai)) return setError('Food businesses need a 14-digit FSSAI registration number.');
    setBusy(true);
    setError(null);
    try {
      await addBusiness({
        name: name.trim(),
        category,
        description: description.trim(),
        phone: phone.replace(/\D/g, '').length >= 10 ? phone.trim() : '',
        is_food: isFood,
        fssai: isFood ? fssai : null,
      });
      toast('Submitted! Your admin will review it.');
      router.back();
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <Screen back title="List my business" subtitle="Reach every family in your society.">
      <Card style={{ padding: 18 }}>
        <StepHeader n={1} title="About your business" />
        <Input label="Business name" value={name} onChangeText={setName} placeholder="Neha's Home Cakes" />
        <ChipSelect label="Category" options={businessCategories} value={category} onChange={setCategory} />
        <Input label="What do you offer?" value={description} onChangeText={setDescription} placeholder="Menu, prices, how to order…" multiline />
        <Input label="Phone for orders" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      </Card>
      {isFood ? (
        <Card style={{ padding: 18 }}>
          <StepHeader n={2} title="FSSAI registration" hint="Required for anything edible" />
          <Input label="14-digit FSSAI number" value={fssai} onChangeText={(t) => setFssai(t.replace(/\D/g, '').slice(0, 14))} keyboardType="number-pad" placeholder="21524019000123" />
          <Fine>Home food sellers in India need at least a basic FSSAI registration (free/low-cost at foscos.fssai.gov.in).</Fine>
        </Card>
      ) : null}
      <ErrorText>{error}</ErrorText>
      <Button title="Submit for approval" icon="checkmark-circle-outline" onPress={submit} loading={busy} full />
      <Fine>Your Society Admin approves listings before they go live.</Fine>
    </Screen>
  );
}
