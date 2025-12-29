# Solar Calculator Documentation

## How the SolarSavers Calculator Works

This document explains how the solar calculator estimates your solar system requirements, costs, and savings.

---

## Input Fields

| Field | Description | Example |
|-------|-------------|---------|
| **Monthly Bill (₹)** | Your current monthly electricity bill amount | ₹5,000 |
| **Property Type** | Home (residential) or Commercial | Home |
| **City/State** | Your location for solar irradiance data | Delhi |
| **Battery Backup** | Yes/No - adds 25% buffer for backup needs | Yes |

---

## Calculation Process

### Step 1: Get City-Specific Data
The system looks up your city in its database to get:
- **Peak Sun Hours**: Average daily hours of optimal sunlight (4.8 - 6.0 hours)
- **Electricity Tariff**: Local grid rates (₹5.50 - ₹9.50 per kWh)

| City | Peak Sun Hours | Tariff (₹/kWh) |
|------|----------------|----------------|
| Delhi | 5.5 | 8.0 |
| Mumbai | 5.0 | 9.5 |
| Bangalore | 5.2 | 7.5 |
| Chennai | 5.8 | 6.5 |
| Jaipur | 6.0 | 7.0 |
| Ahmedabad | 5.8 | 5.5 |

### Step 2: Real-time Weather Check
The calculator calls **OpenWeatherMap API** to get current cloud coverage in your city:
- Clear sky → 100% solar factor
- 50% clouds → 75% solar factor
- 100% clouds → 50% solar factor

This adjusts the calculation for current weather conditions.

### Step 3: Calculate Daily Consumption
```
Daily Consumption (kWh) = Monthly Bill / Tariff / 30 days

Example: ₹5,000 / ₹8.0 / 30 = 20.8 kWh/day
```

### Step 4: Calculate Required System Size
```
Effective Sun Hours = Peak Sun Hours × System Efficiency × Weather Factor
                   = 5.5 × 0.80 × 0.85 = 3.74 hours

Required System Size = Daily Consumption / Effective Sun Hours
                    = 20.8 / 3.74 = 5.56 kW → Rounded to 5.5 kW
```

### Step 5: Add Backup Buffer (if selected)
```
With Backup: System Size × 1.25 = 5.5 × 1.25 = 6.875 kW → 7 kW
```

### Step 6: Calculate Installation Cost
```
Cost = System Size × 1000W × Cost per Watt
     = 7 × 1000 × ₹45 = ₹3,15,000

Apply PM Surya Ghar Subsidy (for residential):
- Up to 2 kW: ₹30,000 subsidy
- Up to 3 kW: ₹60,000 subsidy
- Above 3 kW: ₹78,000 subsidy

Net Cost = ₹3,15,000 - ₹78,000 = ₹2,37,000
```

### Step 7: Calculate Annual Savings
```
Annual Generation = System Size × Peak Sun Hours × 365 days × Efficiency
                 = 7 × 5.5 × 365 × 0.80 = 11,242 kWh/year

Annual Savings = Generation × Tariff × 0.95 (utilization)
              = 11,242 × ₹8.0 × 0.95 = ₹85,439/year
```

### Step 8: Calculate Payback Period
```
Payback Years = Net Cost / Annual Savings
             = ₹2,37,000 / ₹85,439 = 2.8 years
```

### Step 9: Calculate CO2 Reduction
```
CO2 Reduction = Annual Generation × 0.82 kg/kWh (India grid factor)
             = 11,242 × 0.82 = 9,218 kg CO2/year
```

---

## Output Fields

| Output | Description | Example |
|--------|-------------|---------|
| **Recommended System Size** | Total solar capacity needed | 7 kW |
| **Estimated Cost** | Net installation cost after subsidy | ₹2,37,000 |
| **Annual Savings** | Yearly savings on electricity | ₹85,439 |
| **Payback Period** | Time to recover investment | 2.8 years |
| **CO2 Reduction** | Environmental benefit per year | 9,218 kg |

---

## Key Constants Used

| Parameter | Value | Source |
|-----------|-------|--------|
| System Losses | 20% | Inverter, cables, dust, temperature |
| Panel Wattage | 400W | Standard monocrystalline panel |
| Panel Efficiency | 20% | Modern mono panels |
| Cost/Watt (Home) | ₹45 | 2024 India market rate |
| Cost/Watt (Commercial) | ₹40 | Bulk installation discount |
| CO2 Factor | 0.82 kg/kWh | India grid emission factor |

---

## API Endpoint

**POST** `/api/calculator`

**Request Body:**
```json
{
  "monthly_bill": 5000,
  "property_type": "home",
  "city": "Delhi",
  "backup_required": true
}
```

**Response:**
```json
{
  "recommended_size_kw": 7.0,
  "estimated_cost": 237000.00,
  "annual_savings": 85439.20,
  "payback_years": 2.8,
  "co2_reduction_kg": 9218.4
}
```

---

## Data Sources

1. **Peak Sun Hours**: NREL PVWatts, MNRE India data
2. **Electricity Tariffs**: State electricity board rates (2024)
3. **Cost/Watt**: Current India solar market prices
4. **Subsidies**: PM Surya Ghar Muft Bijli Yojana
5. **Weather Data**: OpenWeatherMap API (real-time)
6. **CO2 Factor**: India Central Electricity Authority
