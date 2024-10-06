import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ArrowUp, ArrowDown } from 'lucide-react'

interface ProgressData {
  date: string;
  painLevel: number;
  mobility: number;
  strength: number;
}

const mockProgressData: ProgressData[] = [
  { date: '2023-01-01', painLevel: 8, mobility: 3, strength: 2 },
  { date: '2023-02-01', painLevel: 7, mobility: 4, strength: 3 },
  { date: '2023-03-01', painLevel: 6, mobility: 5, strength: 4 },
  { date: '2023-04-01', painLevel: 5, mobility: 6, strength: 5 },
  { date: '2023-05-01', painLevel: 4, mobility: 7, strength: 6 },
]

const PatientProgress: React.FC = () => {
  const latestData = mockProgressData[mockProgressData.length - 1]
  const previousData = mockProgressData[mockProgressData.length - 2]

  const calculateChange = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return change.toFixed(1)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Tu Progreso</h2>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <ProgressCard
          title="Nivel de Dolor"
          value={latestData.painLevel}
          change={calculateChange(latestData.painLevel, previousData.painLevel)}
          inverse
        />
        <ProgressCard
          title="Movilidad"
          value={latestData.mobility}
          change={calculateChange(latestData.mobility, previousData.mobility)}
        />
        <ProgressCard
          title="Fuerza"
          value={latestData.strength}
          change={calculateChange(latestData.strength, previousData.strength)}
        />
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={mockProgressData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            allowDataOverflow={true}
            allowDecimals={false}
            allowDuplicatedCategory={false}
          />
          <YAxis 
            allowDecimals={false}
            domain={[0, 'dataMax + 1']}
          />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="painLevel" stroke="#FF0000" name="Nivel de Dolor" />
          <Line type="monotone" dataKey="mobility" stroke="#00FF00" name="Movilidad" />
          <Line type="monotone" dataKey="strength" stroke="#0000FF" name="Fuerza" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

interface ProgressCardProps {
  title: string;
  value: number;
  change: string;
  inverse?: boolean;
}

const ProgressCard: React.FC<ProgressCardProps> = ({ title, value, change, inverse = false }) => {
  const isPositive = parseFloat(change) > 0
  const changeColor = inverse
    ? isPositive ? 'text-red-500' : 'text-green-500'
    : isPositive ? 'text-green-500' : 'text-red-500'

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
      <div className={`flex items-center ${changeColor}`}>
        {isPositive ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
        <span className="ml-1">{Math.abs(parseFloat(change))}%</span>
      </div>
    </div>
  )
}

export default PatientProgress