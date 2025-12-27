import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, change, changeType = 'increase', icon: Icon, color = 'primary' }) => {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        green: 'bg-green-100 text-green-600',
        blue: 'bg-blue-100 text-blue-600',
        orange: 'bg-orange-100 text-orange-600',
        purple: 'bg-purple-100 text-purple-600',
        red: 'bg-red-100 text-red-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border p-6 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted-foreground font-medium">{title}</p>
                    <h3 className="text-2xl md:text-3xl font-bold mt-1">{value}</h3>
                    {change && (
                        <div className={`flex items-center gap-1 mt-2 text-sm ${changeType === 'increase' ? 'text-green-600' : 'text-red-500'
                            }`}>
                            {changeType === 'increase' ? (
                                <TrendingUp className="w-4 h-4" />
                            ) : (
                                <TrendingDown className="w-4 h-4" />
                            )}
                            <span>{change}</span>
                        </div>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    <Icon className="w-6 h-6" />
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
