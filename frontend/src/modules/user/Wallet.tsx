
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { getWalletStats, getWalletTransactions, WalletStats, WalletTransaction } from '../../services/api/customerWalletService';
import { useAuth } from '../../context/AuthContext';

const Wallet = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [stats, setStats] = useState<WalletStats | null>(null);
    const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'all' | 'credit' | 'debit'>('all');

    useEffect(() => {
        fetchWalletData();
    }, []);

    const fetchWalletData = async () => {
        try {
            setLoading(true);
            const [statsRes, transRes] = await Promise.all([
                getWalletStats(),
                getWalletTransactions(1, 20) // Get last 20 transactions
            ]);

            if (statsRes.success) setStats(statsRes.data);
            if (transRes.success) setTransactions(transRes.data.transactions);
        } catch (error) {
            console.error('Error fetching wallet data:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredTransactions = transactions.filter(t =>
        activeTab === 'all' ? true : t.type.toLowerCase() === activeTab
    );

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white sticky top-0 z-10 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 px-4 py-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div className="flex flex-col">
                        <h1 className="text-lg font-bold text-gray-900 leading-tight">SpeeUp Money</h1>
                        <span className="text-xs text-gray-500">Secure Payments</span>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 pt-6 space-y-6">
                {/* Balance Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-white shadow-xl"
                >
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
                    <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-teal-500/10 blur-3xl" />

                    <div className="relative">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <p className="text-gray-400 text-sm font-medium mb-1">Total Balance</p>
                                {loading ? (
                                    <div className="h-10 w-32 bg-white/10 rounded animate-pulse" />
                                ) : (
                                    <h2 className="text-4xl font-bold tracking-tight">
                                        ₹{stats?.balance.toLocaleString('en-IN') || '0'}
                                    </h2>
                                )}
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                                <svg className="w-6 h-6 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className="flex-1 bg-teal-500 hover:bg-teal-600 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all active:scale-95 shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Add Money
                            </button>
                            <button
                                onClick={() => navigate('/transactions')} // Or expand modal
                                className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold text-sm transition-all backdrop-blur-sm flex items-center justify-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Statement
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions (Future placeholder) */}
                {/* <div className="grid grid-cols-4 gap-4">
          {['Send', 'Request', 'Scan', 'History'].map((action, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-teal-600">
                <div className="w-6 h-6 bg-current opacity-20" />
              </div>
              <span className="text-xs font-medium text-gray-600">{action}</span>
            </div>
          ))}
        </div> */}

                {/* Transactions Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold text-gray-900">Recent Transactions</h3>
                        {/* Simple Tab Filter */}
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            {(['all', 'credit', 'debit'] as const).map((tab) => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md capitalize transition-all ${activeTab === tab
                                            ? 'bg-white text-gray-900 shadow-sm'
                                            : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm animate-pulse flex justify-between items-center">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-gray-100" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-32 bg-gray-100 rounded" />
                                            <div className="h-3 w-20 bg-gray-100 rounded" />
                                        </div>
                                    </div>
                                    <div className="h-5 w-16 bg-gray-100 rounded" />
                                </div>
                            ))
                        ) : filteredTransactions.length > 0 ? (
                            filteredTransactions.map((transaction) => (
                                <motion.div
                                    key={transaction._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${transaction.type === 'Credit'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                            }`}>
                                            {transaction.type === 'Credit' ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 line-clamp-1">{transaction.description}</p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(transaction.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-bold ${transaction.type === 'Credit' ? 'text-green-600' : 'text-gray-900'
                                            }`}>
                                            {transaction.type === 'Credit' ? '+' : '-'}₹{transaction.amount}
                                        </p>
                                        <p className={`text-[10px] uppercase font-bold tracking-wider ${transaction.status === 'Completed' ? 'text-green-500' : 'text-orange-500'
                                            }`}>
                                            {transaction.status}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-gray-900 font-semibold mb-1">No transactions yet</h3>
                                <p className="text-gray-500 text-sm">Your recent activity will show up here</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Wallet;
