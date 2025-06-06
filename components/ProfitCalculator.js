
import { useState } from "react";
const Button = ({ children, ...props }) => (
  <button className="px-4 py-2 bg-blue-600 text-white rounded" {...props}>{children}</button>
);

export default function ProfitCalculator() {
  const [inputs, setInputs] = useState({
    productCostTL: 600000,
    freightEuro: 4500,
    euroToTL: 45,
    sekRate: 4.11,
    sellingPriceSEK: 11500,
    tonnage: 20,
    kdvRate: 12,
    taxRate: 22,
    targetNetProfitPerTon: 1000
  });

  const fetchRates = async () => {
    try {
      const response = await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=TRY,SEK");
      const data = await response.json();
      const eurToTry = data.rates.TRY;

      const responseSek = await fetch("https://api.exchangerate.host/latest?base=SEK&symbols=TRY");
      const dataSek = await responseSek.json();
      const sekToTry = dataSek.rates.TRY;

      setInputs({
        ...inputs,
        euroToTL: parseFloat(eurToTry.toFixed(2)),
        sekRate: parseFloat(sekToTry.toFixed(2))
      });
    } catch (error) {
      alert("Kur bilgileri alınamadı.");
    }
  };

  const handleChange = (e) => {
    setInputs({ ...inputs, [e.target.name]: parseFloat(e.target.value) });
  };

  const {
    productCostTL,
    freightEuro,
    euroToTL,
    sekRate,
    sellingPriceSEK,
    tonnage,
    kdvRate,
    taxRate,
    targetNetProfitPerTon
  } = inputs;

  const freightTL = freightEuro * euroToTL;
  const totalTL = productCostTL + freightTL;
  const customsTL = productCostTL * 0.06;
  const insuranceTL = productCostTL * 0.01;
  const labelDepotTL = productCostTL * 0.01;
  const fullCostTL = totalTL + customsTL + insuranceTL + labelDepotTL;
  const fullCostSEK = fullCostTL / sekRate;
  const costPerTonSEK = fullCostSEK / tonnage;

  const totalSellingSEK = sellingPriceSEK * tonnage;
  const kdvAmount = totalSellingSEK * (kdvRate / 100);
  const grossProfit = totalSellingSEK - fullCostSEK;
  const tax = grossProfit * (taxRate / 100);
  const netProfit = grossProfit - tax;

  const requiredGrossProfitPerTon = targetNetProfitPerTon / (1 - taxRate / 100);
  const requiredSellingPricePerTon = costPerTonSEK + requiredGrossProfitPerTon;
  const requiredSellingPricePerTonWithKDV = requiredSellingPricePerTon * (1 + kdvRate / 100);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Kâr Hesaplama Aracı</h1>

      <Button className="mb-4" onClick={fetchRates}>Güncel Kurları Al</Button>

      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Ürün Maliyeti (TL)", name: "productCostTL" },
          { label: "Nakliye (€)", name: "freightEuro" },
          { label: "Euro/TL Kuru", name: "euroToTL" },
          { label: "SEK Kuru", name: "sekRate" },
          { label: "Satış Fiyatı (SEK, KDV Hariç)", name: "sellingPriceSEK" },
          { label: "Tonaj (ton)", name: "tonnage" },
          { label: "KDV Oranı (%)", name: "kdvRate" },
          { label: "Vergi Oranı (%)", name: "taxRate" },
          { label: "Hedef Net Kâr (SEK/Ton)", name: "targetNetProfitPerTon" }
        ].map((input) => (
          <div key={input.name}>
            <label className="block text-sm font-medium mb-1">{input.label}</label>
            <input
              type="number"
              name={input.name}
              value={inputs[input.name]}
              onChange={handleChange}
              className="w-full p-2 border rounded"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Sonuçlar</h2>
        <p><strong>Toplam Maliyet (SEK):</strong> {fullCostSEK.toFixed(2)}</p>
        <p><strong>Ton Başına Maliyet (SEK):</strong> {costPerTonSEK.toFixed(2)}</p>
        <p><strong>Toplam Satış (SEK):</strong> {totalSellingSEK.toFixed(2)}</p>
        <p><strong>KDV Tutarı (SEK):</strong> {kdvAmount.toFixed(2)}</p>
        <p><strong>Brüt Kâr (SEK):</strong> {grossProfit.toFixed(2)}</p>
        <p><strong>Vergi (%{taxRate}) (SEK):</strong> {tax.toFixed(2)}</p>
        <p><strong>Net Kâr (SEK):</strong> {netProfit.toFixed(2)}</p>
      </div>

      <div className="mt-6 p-4 bg-green-100 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Hedefe Göre Satış Önerisi</h2>
        <p><strong>Hedef Net Kâr / Ton:</strong> {targetNetProfitPerTon} SEK</p>
        <p><strong>Gerekli Satış Fiyatı (KDV Hariç):</strong> {requiredSellingPricePerTon.toFixed(2)} SEK</p>
        <p><strong>Gerekli Satış Fiyatı (KDV Dahil):</strong> {requiredSellingPricePerTonWithKDV.toFixed(2)} SEK</p>
      </div>
    </div>
  );
}
