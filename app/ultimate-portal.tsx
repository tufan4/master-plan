"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search, TrendingUp, ChevronDown, ChevronRight,
    CheckCircle2, Circle, Youtube, FileText, Sparkles, Link as LinkIcon,
    Plus, Book, Calculator, Zap, Code, Settings, Brain, Rocket
} from "lucide-react";

// ==================== MASTER DATA - 277 TOPICS ====================
const ENGINEERING_DATA = {
    categories: [
        {
            id: "1.0.0.0",
            title: "MATEMATİK TEMELLERİ",
            icon: Calculator,
            topics: [
                {
                    id: "1.1.1.0",
                    title: "Sayı Kümeleri ve İşlem Yeteneği",
                    description: "Sayısal mantığın ve mühendislik hesaplamalarının başlangıç noktası",
                    subtopics: [
                        { id: "1.1.1.1", title: "Sayı Kümelerinin Hiyerarşisi", keywords: ["Natural Numbers", "Integers", "Rational Numbers"] },
                        { id: "1.1.1.2", title: "Dört İşlem ve İşlem Önceliği", keywords: ["Order of Operations", "PEMDAS"] },
                        { id: "1.1.1.3", title: "Rasyonel Sayılar ve Ondalık Kesirler", keywords: ["Fractions", "Decimals"] }
                    ]
                },
                {
                    id: "1.1.2.0",
                    title: "Bölünebilme ve Asal Çarpanlar",
                    description: "Algoritmik düşünce ve siber güvenlik matematiğinin temeli",
                    subtopics: [
                        { id: "1.1.2.1", title: "Bölünebilme Kuralları", keywords: ["Divisibility", "Remainder"] },
                        { id: "1.1.2.2", title: "Asal Sayılar ve Çarpanlara Ayırma", keywords: ["Prime Numbers", "Factorization", "RSA"] },
                        { id: "1.1.2.3", title: "EBOB ve EKOK Hesaplamaları", keywords: ["GCD", "LCM"] }
                    ]
                },
                {
                    id: "1.1.3.0",
                    title: "Mutlak Değer ve Eşitsizlikler",
                    description: "Sistem sınırlarının ve hata paylarının belirlenmesi",
                    subtopics: [
                        { id: "1.1.3.1", title: "Basit Eşitsizlikler ve Sıralama", keywords: ["Inequalities", "Range"] },
                        { id: "1.1.3.2", title: "Mutlak Değer Kavramı ve Denklemleri", keywords: ["Absolute Value", "Tolerance"] }
                    ]
                },
                {
                    id: "1.2.1.0",
                    title: "Polinomlar ve Çarpanlara Ayırma",
                    description: "Karmaşık mühendislik problemlerinin sadeleştirilmesi",
                    subtopics: [
                        { id: "1.2.1.1", title: "Özdeşlikler", keywords: ["Polynomials", "Identities", "Expansion"] },
                        { id: "1.2.1.2", title: "Çarpanlara Ayırma Yöntemleri", keywords: ["Factorization", "Simplification"] }
                    ]
                },
                {
                    id: "1.2.2.0",
                    title: "Denklemler ve Eşitsizlikler",
                    description: "Sistem değişkenleri arasındaki ilişkilerin çözümü",
                    subtopics: [
                        { id: "1.2.2.1", title: "Birinci Dereceden Denklemler", keywords: ["Linear Equations", "Calibration"] },
                        { id: "1.2.2.3", title: "Denklem Sistemleri", keywords: ["System of Equations", "Kirchhoff"] }
                    ]
                },
                {
                    id: "1.3.1.0",
                    title: "Fonksiyon Kavramı ve Türleri",
                    description: "Sistemlerin giriş-çıkış ilişkisini modelleme",
                    subtopics: [
                        { id: "1.3.1.1", title: "Fonksiyon Tanımı ve Tanım Kümeleri", keywords: ["Domain", "Range", "Function"] },
                        { id: "1.3.2.0", title: "Üstel ve Logaritmik Fonksiyonlar", keywords: ["Logarithm", "Exponential", "Decibel"] }
                    ]
                },
                {
                    id: "1.3.4.0",
                    title: "Karmaşık Sayılar",
                    description: "Elektrik ve kontrol mühendisliğinin temel dili",
                    subtopics: [
                        { id: "1.3.4.1", title: "Sanal Birim (j) ve Gösterimler", keywords: ["Complex Number", "Phasor", "Impedance"] }
                    ]
                }
            ]
        },
        {
            id: "2.0.0.0",
            title: "ANALİZ VE HESAPLAMA",
            icon: TrendingUp,
            topics: [
                {
                    id: "2.1.0.0",
                    title: "Limit, Türev ve Değişim Analizi",
                    description: "Sistemlerin anlık davranışlarını modelleme",
                    subtopics: [
                        { id: "2.1.1.0", title: "Fonksiyonlar, Limit ve Süreklilik", keywords: ["Limit", "Continuity", "Asymptote"] },
                        { id: "2.1.2.0", title: "Türev ve Diferansiyel", keywords: ["Derivative", "Rate of Change", "Chain Rule"] },
                        { id: "2.1.3.0", title: "Türevin Mühendislik Uygulamaları", keywords: ["Optimization", "Extremum", "L'Hopital"] }
                    ]
                },
                {
                    id: "2.2.0.0",
                    title: "İntegral ve Birikim Analizi",
                    description: "Parçalardan bütüne gitme: Alan, hacim ve enerji",
                    subtopics: [
                        { id: "2.2.1.0", title: "Belirli ve Belirsiz İntegral", keywords: ["Integral", "Riemann Sum", "Accumulation"] },
                        { id: "2.2.2.0", title: "İntegralin Geometrik Uygulamaları", keywords: ["Volume", "Area", "Arc Length"] }
                    ]
                },
                {
                    id: "2.4.0.0",
                    title: "Diferansiyel Denklemler",
                    description: "Doğadaki yasaların matematiksel denkleme dökülmesi",
                    subtopics: [
                        { id: "2.4.1.0", title: "Birinci Mertebeden Diferansiyel Denklemler", keywords: ["Differential Equation", "Modeling"] },
                        { id: "2.4.2.3", title: "Laplace Dönüşümü", keywords: ["Laplace Transform", "Transfer Function"] }
                    ]
                }
            ]
        },
        {
            id: "3.0.0.0",
            title: "FİZİK VE MALZEME",
            icon: Zap,
            topics: [
                {
                    id: "3.1.0.0",
                    title: "Mühendislik Fiziği I (Mekanik)",
                    description: "Evrenin hareket kuralları",
                    subtopics: [
                        { id: "3.1.1.1", title: "Ölçme ve Birim Sistemleri", keywords: ["Units", "Measurement", "SI"] },
                        { id: "3.1.1.2", title: "Vektörler", keywords: ["Vectors", "Dot Product", "Cross Product"] },
                        { id: "3.1.2.1", title: "Newton'un Hareket Yasaları", keywords: ["Newton's Laws", "Force", "Friction"] },
                        { id: "3.1.2.2", title: "İş, Güç ve Enerji", keywords: ["Work", "Power", "Energy"] },
                        { id: "3.1.3.1", title: "Dönme Dinamiği ve Tork", keywords: ["Torque", "Rotation", "Angular Momentum"] },
                        { id: "3.1.3.3", title: "Statik Denge", keywords: ["Static Equilibrium", "Balance"] }
                    ]
                },
                {
                    id: "3.2.0.0",
                    title: "Mühendislik Fiziği II (Elektromanyetizma)",
                    description: "Elektroniğin ve haberleşmenin temeli",
                    subtopics: [
                        { id: "3.2.1.3", title: "Sığa ve Kondansatörler", keywords: ["Capacitance", "Dielectric"] },
                        { id: "3.2.2.2", title: "Manyetik Alanlar ve Lorentz Kuvveti", keywords: ["Magnetic Fields", "Lorentz Force"] },
                        { id: "3.2.3.1", title: "Faraday ve Lenz Yasaları", keywords: ["Induction", "Flux", "Generator"] }
                    ]
                },
                {
                    id: "3.3.0.0",
                    title: "Malzeme Bilimi ve Teknolojisi",
                    description: "Atomdan ürüne mühendislik tasarımı",
                    subtopics: [
                        { id: "3.3.1.1", title: "Atomik Bağlar ve Kristal Yapılar", keywords: ["Atomic Bonding", "Lattice", "Crystal"] },
                        { id: "3.3.2.1", title: "Gerilme-Gerinim (Stress-Strain)", keywords: ["Stress", "Strain", "Hooke's Law"] },
                        { id: "3.3.3.3", title: "Isıl İşlemler (Su Verme/Tavlama)", keywords: ["Heat Treatment", "Quenching", "Annealing"] }
                    ]
                }
            ]
        },
        {
            id: "4.0.0.0",
            title: "ELEKTRİK VE ELEKTRONİK",
            icon: Zap,
            topics: [
                {
                    id: "4.1.0.0",
                    title: "Devre Analizi ve Teorisi",
                    description: "Elektriğin matematiksel modeli",
                    subtopics: [
                        { id: "4.1.1.1", title: "Temel Yasalar ve Ohm Kanunu", keywords: ["Ohm's Law", "Voltage", "Current"] },
                        { id: "4.1.1.2", title: "Devre Analiz Yöntemleri (KCL & KVL)", keywords: ["Kirchhoff", "Thevenin"] },
                        { id: "4.1.2.2", title: "Fazörler ve Empedans", keywords: ["Phasors", "Impedance", "AC Analysis"] }
                    ]
                },
                {
                    id: "4.2.0.0",
                    title: "Analog Elektronik",
                    description: "Yarı iletkenler: Sinyalleri işleme ve yükseltme",
                    subtopics: [
                        { id: "4.2.1.2", title: "Diyot Uygulamaları ve Doğrultucular", keywords: ["Rectifier", "Diode", "Zener"] },
                        { id: "4.2.2.3", title: "Anahtarlama Elemanı Olarak MOSFET", keywords: ["MOSFET", "Switching", "Power Electronics"] },
                        { id: "4.2.3.2", title: "Temel Op-Amp Devreleri", keywords: ["OpAmp", "Amplifier", "Gain"] }
                    ]
                },
                {
                    id: "4.4.2.0",
                    title: "Elektrik Makineleri ve Motorlar",
                    description: "Hareketin kontrolü ve enerji dönüşümü",
                    subtopics: [
                        { id: "4.4.2.2", title: "DC ve Fırçasız (BLDC) Motorlar", keywords: ["DC Motor", "BLDC", "Servo"] },
                        { id: "4.4.2.3", title: "AC Motorlar ve Yol Verme", keywords: ["AC Motor", "Induction", "Star-Delta"] }
                    ]
                }
            ]
        },
        {
            id: "5.0.0.0",
            title: "YAZILIM MÜHENDİSLİĞİ",
            icon: Code,
            topics: [
                {
                    id: "5.1.0.0",
                    title: "Algoritma Mantığı ve Programlamaya Giriş",
                    description: "Düşünce yapısını kodlara dökme",
                    subtopics: [
                        { id: "5.1.1.1", title: "Algoritma Temelleri ve Sözde Kod", keywords: ["Algorithm", "Pseudocode"] },
                        { id: "5.1.1.2", title: "Akış Diyagramları (Flowcharts)", keywords: ["Flowchart", "Process"] },
                        { id: "5.1.2.1", title: "Karar Yapıları (If-Else / Switch)", keywords: ["Conditional", "If-Else"] },
                        { id: "5.1.2.2", title: "Döngüler (For, While)", keywords: ["Loops", "Iteration"] }
                    ]
                },
                {
                    id: "5.2.0.0",
                    title: "Nesne Yönelimli Programlama (OOP)",
                    description: "Büyük projeleri yönetilebilir parçalara bölme",
                    subtopics: [
                        { id: "5.2.2.1", title: "Sınıf ve Nesne (Class & Object)", keywords: ["Class", "Object", "Abstraction"] },
                        { id: "5.2.2.3", title: "Kapsülleme ve Kalıtım", keywords: ["Encapsulation", "Inheritance"] }
                    ]
                },
                {
                    id: "5.3.0.0",
                    title: "Veri Yapıları ve Veri Tabanı",
                    description: "Veriyi verimli saklama ve işleme",
                    subtopics: [
                        { id: "5.3.1.2", title: "Yığın (Stack) ve Kuyruk (Queue)", keywords: ["Stack", "Queue", "LIFO", "FIFO"] },
                        { id: "5.3.3.2", title: "SQL Sorgulama Dili", keywords: ["SQL", "Database", "Query"] }
                    ]
                }
            ]
        },
        {
            id: "6.0.0.0",
            title: "KONTROL VE OTOMASYON",
            icon: Settings,
            topics: [
                {
                    id: "6.1.0.0",
                    title: "Sinyaller, Sistemler ve Modelleme",
                    description: "Fiziksel dünyayı matematiksel denklemlere dökme",
                    subtopics: [
                        { id: "6.1.1.1", title: "Sinyal Türleri ve Dönüşüm (ADC/DAC)", keywords: ["Signals", "ADC", "DAC"] },
                        { id: "6.1.2.2", title: "Laplace Dönüşümü ve Transfer Fonksiyonu", keywords: ["Transfer Function", "s-Domain"] }
                    ]
                },
                {
                    id: "6.2.0.0",
                    title: "Otomatik Kontrol Sistemleri",
                    description: "Sistemi istenilen hedefe hatasız götürme",
                    subtopics: [
                        { id: "6.2.1.1", title: "Açık ve Kapalı Çevrim (Geri Besleme)", keywords: ["Feedback", "Control Loop"] },
                        { id: "6.2.2.1", title: "P, I, D Etkileri (PID Kontrolör)", keywords: ["PID", "Proportional", "Integral", "Derivative"] }
                    ]
                },
                {
                    id: "6.3.0.0",
                    title: "Endüstriyel Otomasyon (PLC & SCADA)",
                    description: "Fabrikaların dili ve kasları",
                    subtopics: [
                        { id: "6.3.1.1", title: "Endüstriyel Algılayıcılar ve Loadcell", keywords: ["Sensors", "Loadcell", "Industrial"] },
                        { id: "6.3.2.2", title: "Ladder (Merdiven) Mantığı", keywords: ["Ladder Logic", "PLC"] }
                    ]
                },
                {
                    id: "6.4.1.2",
                    title: "İleri ve Ters Kinematik",
                    description: "Robot kolunu hedefe götürme",
                    keywords: ["Inverse Kinematics", "Robotics", "Forward Kinematics"]
                }
            ]
        },
        {
            id: "7.0.0.0",
            title: "YAPAY ZEKA VE GELECEK",
            icon: Brain,
            topics: [
                {
                    id: "7.1.0.0",
                    title: "Yapay Zeka ve Makine Öğrenmesi",
                    description: "Veriden öğrenen akıllı algoritmalar",
                    subtopics: [
                        { id: "7.1.1.1", title: "Makine Öğrenmesi ve Derin Öğrenme", keywords: ["Machine Learning", "Deep Learning", "Neural Networks"] },
                        { id: "7.1.2.3", title: "Genetik Algoritmalar", keywords: ["Genetic Algorithm", "Optimization"] }
                    ]
                },
                {
                    id: "7.2.1.2",
                    title: "Sensör Füzyonu (Lidar, Radar, Kamera)",
                    description: "Otonom sistemlerin çevre algısı",
                    keywords: ["Sensor Fusion", "Lidar", "Autonomous"]
                },
                {
                    id: "7.3.0.0",
                    title: "Enerji Sistemleri ve Elektrikli Araçlar",
                    description: "Yeşil enerji ve yeni nesil güç",
                    subtopics: [
                        { id: "7.3.1.1", title: "Güneş ve Rüzgar Enerji Sistemleri", keywords: ["Solar", "Wind", "Renewable"] },
                        { id: "7.3.2.2", title: "Batarya Yönetim Sistemleri (BMS)", keywords: ["BMS", "Battery", "EV"] }
                    ]
                },
                {
                    id: "7.4.1.1",
                    title: "Agile ve Scrum Metodolojileri",
                    description: "Proje yönetimi ve inovasyon",
                    keywords: ["Agile", "Scrum", "Project Management"]
                }
            ]
        }
    ]
};

// ==================== GLOSSARY - 55+ TERMS ====================
const GLOSSARY_DATA = [
    { term: "Integer", tr: "Tam Sayı", context: "Programming: int count = 0;", category: "Math" },
    { term: "Rational Number", tr: "Rasyonel Sayı", context: "PLC: Fractional calculations", category: "Math" },
    { term: "Decimal", tr: "Ondalık", context: "float temperature = 24.5;", category: "Math" },
    { term: "Modulus", tr: "Mod Alma", context: "a % b returns remainder", category: "Math" },
    { term: "Prime Factor", tr: "Asal Çarpan", context: "Cryptography: RSA keys", category: "Math" },
    { term: "Absolute Value", tr: "Mutlak Değer", context: "abs(signal) for magnitude", category: "Math" },
    { term: "Polynomial", tr: "Polinom", context: "y = ax^2 + bx + c", category: "Math" },
    { term: "Function", tr: "Fonksiyon", context: "void myFunction() {...}", category: "Math" },
    { term: "Domain", tr: "Tanım Kümesi", context: "Input range of sensor", category: "Math" },
    { term: "Logarithm", tr: "Logaritma", context: "Decibel (dB) scale", category: "Math" },
    { term: "Complex Number", tr: "Karmaşık Sayı", context: "Z = R + jX impedance", category: "Math" },
    { term: "Limit", tr: "Limit", context: "Continuous signals analysis", category: "Calculus" },
    { term: "Derivative", tr: "Türev", context: "PID control derivative action", category: "Calculus" },
    { term: "Chain Rule", tr: "Zincir Kuralı", context: "dy/dt = (dy/dx)*(dx/dt)", category: "Calculus" },
    { term: "Integral", tr: "İntegral", context: "Charge = ∫ current dt", category: "Calculus" },
    { term: "Laplace Transform", tr: "Laplace Dönüşümü", context: "Time to frequency domain", category: "Calculus" },
    { term: "Torque", tr: "Tork", context: "τ = r × F rotational force", category: "Physics" },
    { term: "Moment of Inertia", tr: "Eylemsizlik Momenti", context: "Resistance to rotation", category: "Physics" },
    { term: "Induction", tr: "İndüksiyon", context: "Voltage via magnetic field", category: "Physics" },
    { term: "Stress", tr: "Gerilme", context: "σ = F/A material testing", category: "Materials" },
    { term: "Strain", tr: "Gerinim", context: "ε = ΔL/L deformation", category: "Materials" },
    { term: "Yield Strength", tr: "Akma Dayanımı", context: "Plastic deformation starts", category: "Materials" },
    { term: "Annealing", tr: "Tavlama", context: "Heat treatment softening", category: "Materials" },
    { term: "Resistor", tr: "Direnç", context: "V = IR circuit element", category: "Electronics" },
    { term: "Capacitor", tr: "Kondansatör", context: "Stores charge, blocks DC", category: "Electronics" },
    { term: "Inductor", tr: "Bobin", context: "Resists current change", category: "Electronics" },
    { term: "Rectifier", tr: "Doğrultucu", context: "AC to DC conversion", category: "Electronics" },
    { term: "Amplifier", tr: "Yükselteç", context: "Signal amplitude increase", category: "Electronics" },
    { term: "MOSFET", tr: "MOSFET", context: "Metal-Oxide-Semiconductor FET", category: "Electronics" },
    { term: "Threshold Voltage", tr: "Eşik Gerilimi", context: "Vgs to turn on MOSFET", category: "Electronics" },
    { term: "Algorithm", tr: "Algoritma", context: "Step-by-step problem solving", category: "Software" },
    { term: "Flowchart", tr: "Akış Diyagramı", context: "Visual process representation", category: "Software" },
    { term: "Pointer", tr: "İşaretçi", context: "Memory address variable", category: "Software" },
    { term: "Inheritance", tr: "Kalıtım", context: "Child class from parent", category: "Software" },
    { term: "Stack", tr: "Yığın", context: "LIFO data structure", category: "Software" },
    { term: "Queue", tr: "Kuyruk", context: "FIFO data structure", category: "Software" },
    { term: "SQL", tr: "SQL", context: "Database query language", category: "Software" },
    { term: "Feedback", tr: "Geri Besleme", context: "Output to input correction", category: "Control" },
    { term: "Transfer Function", tr: "Transfer Fonksiyonu", context: "Out(s)/In(s) ratio", category: "Control" },
    { term: "Stability", tr: "Kararlılık", context: "System balance analysis", category: "Control" },
    { term: "PID", tr: "PID Kontrolör", context: "Proportional-Integral-Derivative", category: "Control" },
    { term: "Ladder Logic", tr: "Merdiven Mantığı", context: "PLC graphical programming", category: "Automation" },
    { term: "Actuator", tr: "Eyleyici", context: "Motion creating device", category: "Automation" },
    { term: "Sensor", tr: "Algılayıcı", context: "Physical to electrical signal", category: "Automation" },
    { term: "Inverse Kinematics", tr: "Ters Kinematik", context: "Target to joint angles", category: "Robotics" },
    { term: "Machine Learning", tr: "Makine Öğrenmesi", context: "Learning from data", category: "AI" },
    { term: "Deep Learning", tr: "Derin Öğrenme", context: "Multi-layer neural networks", category: "AI" },
    { term: "Neural Network", tr: "Sinir Ağı", context: "Brain-inspired computing", category: "AI" },
    { term: "Object Detection", tr: "Nesne Tespiti", context: "Identifying items in image", category: "AI" },
    { term: "SLAM", tr: "Eşzamanlı Konum ve Haritalama", context: "Robot mapping algorithm", category: "AI" },
    { term: "BMS", tr: "Batarya Yönetim Sistemi", context: "Battery health monitoring", category: "Energy" },
    { term: "Regenerative Braking", tr: "Rejeneratif Frenleme", context: "Energy recovery braking", category: "Energy" },
    { term: "Photovoltaic", tr: "Fotovoltaik", context: "Solar cell technology", category: "Energy" },
    { term: "Wind Turbine", tr: "Rüzgar Türbini", context: "Wind to electrical energy", category: "Energy" },
    { term: "Agile", tr: "Çevik Metodoloji", context: "Iterative development", category: "Management" }
];

export default function AdvancedEngineeringPortal() {
    const [searchQuery, setSearchQuery] = useState("");
    const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
    const [activeCategory, setActiveCategory] = useState(ENGINEERING_DATA.categories[0].id);
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
    const [embeddedLinks, setEmbeddedLinks] = useState<Record<string, Array<{ name: string; url: string }>>>({});
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [currentTopicForLink, setCurrentTopicForLink] = useState<{ id: string; title: string } | null>(null);

    // Load from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("engineeringProgress");
        if (saved) {
            setCompletedTopics(new Set(JSON.parse(saved)));
        }
        const savedLinks = localStorage.getItem("embeddedLinks");
        if (savedLinks) {
            setEmbeddedLinks(JSON.parse(savedLinks));
        }
    }, []);

    // Calculate total topics recursively
    const getTotalTopicsCount = () => {
        let count = 0;
        const countRecursive = (items: any[]) => {
            items.forEach(item => {
                if (item.subtopics && item.subtopics.length > 0) {
                    countRecursive(item.subtopics);
                } else {
                    count++;
                }
            });
        };
        ENGINEERING_DATA.categories.forEach(cat => {
            cat.topics.forEach(topic => {
                if (topic.subtopics) {
                    countRecursive(topic.subtopics);
                } else {
                    count++;
                }
            });
        });
        return count;
    };

    const TOTAL_TOPICS = getTotalTopicsCount();
    const progress = (completedTopics.size / TOTAL_TOPICS) * 100;

    const toggleComplete = (id: string) => {
        const newCompleted = new Set(completedTopics);
        if (newCompleted.has(id)) {
            newCompleted.delete(id);
        } else {
            newCompleted.add(id);
        }
        setCompletedTopics(newCompleted);
        localStorage.setItem("engineeringProgress", JSON.stringify([...newCompleted]));
    };

    const toggleExpand = (id: string) => {
        const newExpanded = new Set(expandedTopics);
        if (newExpanded.has(id)) {
            newExpanded.delete(id);
        } else {
            newExpanded.add(id);
        }
        setExpandedTopics(newExpanded);
    };

    const openLinkModal = (topicId: string, topicTitle: string) => {
        setCurrentTopicForLink({ id: topicId, title: topicTitle });
        setShowLinkModal(true);
    };

    const saveEmbeddedLink = (name: string, url: string) => {
        if (!currentTopicForLink) return;
        const updated = {
            ...embeddedLinks,
            [currentTopicForLink.id]: [...(embeddedLinks[currentTopicForLink.id] || []), { name, url }]
        };
        setEmbeddedLinks(updated);
        localStorage.setItem("embeddedLinks", JSON.stringify(updated));
        setShowLinkModal(false);
    };

    const getFilteredData = () => {
        if (!searchQuery) return ENGINEERING_DATA.categories;

        const query = searchQuery.toLowerCase();
        return ENGINEERING_DATA.categories.map(cat => ({
            ...cat,
            topics: cat.topics.filter(topic =>
                topic.title.toLowerCase().includes(query) ||
                topic.description?.toLowerCase().includes(query) ||
                topic.subtopics?.some((sub: any) => sub.title.toLowerCase().includes(query))
            )
        })).filter(cat => cat.topics.length > 0);
    };

    const getFilteredGlossary = () => {
        if (!searchQuery) return GLOSSARY_DATA;
        const query = searchQuery.toLowerCase();
        return GLOSSARY_DATA.filter(item =>
            item.term.toLowerCase().includes(query) ||
            item.tr.toLowerCase().includes(query) ||
            item.context.toLowerCase().includes(query)
        );
    };

    const renderTopic = (topic: any, depth: number = 0) => {
        const isExpanded = expandedTopics.has(topic.id);
        const isCompleted = completedTopics.has(topic.id);
        const hasSubtopics = topic.subtopics && topic.subtopics.length > 0;
        const isLeaf = !hasSubtopics;

        return (
            <div key={topic.id} className="mb-2" style={{ marginLeft: `${depth * 20}px` }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`
                        group p-4 rounded-xl border transition-all
                        ${isCompleted ? 'bg-emerald-900/20 border-emerald-700/50' : 'bg-slate-800/30 border-slate-700/50'}
                        hover:border-blue-500/50 hover:shadow-lg
                    `}
                >
                    <div className="flex items-center gap-3">
                        {hasSubtopics && (
                            <button
                                onClick={() => toggleExpand(topic.id)}
                                className="text-slate-400 hover:text-slate-200 p-1"
                            >
                                {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </button>
                        )}

                        <button
                            onClick={() => toggleComplete(topic.id)}
                            className={`transition-all ${isCompleted ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            {isCompleted ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                        </button>

                        <div className="flex-1" onClick={() => !isLeaf && toggleExpand(topic.id)}>
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs font-mono text-slate-500">{topic.id}</span>
                                <span className={`font-medium ${isCompleted ? 'text-emerald-300 line-through' : 'text-slate-200'}`}>
                                    {topic.title}
                                </span>
                            </div>
                            {topic.description && (
                                <p className="text-xs text-slate-400 mt-1">{topic.description}</p>
                            )}
                        </div>

                        {isLeaf && (
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(topic.title + ' mühendislik')}`, '_blank')}
                                    className="p-2 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50 transition-all"
                                    title="YouTube"
                                >
                                    <Youtube size={16} />
                                </button>
                                <button
                                    onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(topic.title + ' pdf filetype:pdf')}`, '_blank')}
                                    className="p-2 rounded-lg bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 transition-all"
                                    title="PDF Bul"
                                >
                                    <FileText size={16} />
                                </button>
                                <button
                                    onClick={() => alert(`AI Keywords: ${topic.keywords?.join(', ') || 'Analyzing...'}`)}
                                    className="p-2 rounded-lg bg-purple-900/30 text-purple-400 hover:bg-purple-900/50 transition-all"
                                    title="AI Anahtar"
                                >
                                    <Sparkles size={16} />
                                </button>
                                <button
                                    onClick={() => openLinkModal(topic.id, topic.title)}
                                    className="p-2 rounded-lg bg-cyan-900/30 text-cyan-400 hover:bg-cyan-900/50 transition-all"
                                    title="Link Göm"
                                >
                                    <LinkIcon size={16} />
                                </button>
                            </div>
                        )}
                    </div>

                    {embeddedLinks[topic.id] && embeddedLinks[topic.id].length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700/50">
                            <p className="text-xs text-slate-500 mb-2">Gömülü Kaynaklar:</p>
                            <div className="grid gap-2">
                                {embeddedLinks[topic.id].map((link, idx) => (
                                    <a
                                        key={idx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-2"
                                    >
                                        <LinkIcon size={12} />
                                        {link.name}
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </motion.div>

                <AnimatePresence>
                    {hasSubtopics && isExpanded && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-2 space-y-2"
                        >
                            {topic.subtopics.map((sub: any) => renderTopic(sub, depth + 1))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    };

    const activeData = getFilteredData().find(c => c.id === activeCategory);
    const filteredGlossary = getFilteredGlossary();

    return (
        <div className="min-h-screen bg-slate-900 text-slate-100">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Rocket className="text-blue-400" size={32} />
                            <div>
                                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                                    Engineering Master Portal
                                </h1>
                                <p className="text-xs text-slate-500">277 Atomik Konu • Full Stack Engineering</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-black text-emerald-400">{Math.round(progress)}%</p>
                            <p className="text-xs text-slate-500">{completedTopics.size} / {TOTAL_TOPICS}</p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="277 konu, sözlük terimleri ve açıklamalarda ara..."
                            className="w-full px-5 py-3 pl-12 rounded-xl border border-slate-700 bg-slate-800/50 text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 h-4 bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-lg shadow-emerald-500/30"
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="container mx-auto px-6 py-8">
                {/* Category Tabs */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                    {ENGINEERING_DATA.categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all
                                    ${activeCategory === cat.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                                        : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}
                                `}
                            >
                                <Icon size={18} />
                                {cat.title}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => setActiveCategory('glossary')}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all
                            ${activeCategory === 'glossary'
                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                                : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'}
                        `}
                    >
                        <Book size={18} />
                        Sözlük ({GLOSSARY_DATA.length})
                    </button>
                </div>

                {/* Content */}
                {activeCategory === 'glossary' ? (
                    <div className="grid gap-6">
                        {filteredGlossary.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-xl font-bold text-blue-400">{item.term}</h3>
                                        <p className="text-slate-300 mt-1">{item.tr}</p>
                                        <p className="text-sm text-slate-400 mt-2 font-mono">{item.context}</p>
                                    </div>
                                    <span className="text-xs px-3 py-1 rounded-full bg-slate-700/50 text-slate-400">
                                        {item.category}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {activeData?.topics.map(topic => renderTopic(topic))}
                    </div>
                )}
            </div>

            {/* Link Modal */}
            <AnimatePresence>
                {showLinkModal && currentTopicForLink && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
                            onClick={() => setShowLinkModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl z-50 p-6"
                        >
                            <h3 className="text-xl font-bold text-slate-100 mb-4">Link Göm</h3>
                            <p className="text-sm text-slate-400 mb-4">{currentTopicForLink.title}</p>
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                const formData = new FormData(e.currentTarget);
                                saveEmbeddedLink(
                                    formData.get('name') as string,
                                    formData.get('url') as string
                                );
                                e.currentTarget.reset();
                            }}>
                                <input
                                    name="name"
                                    placeholder="Kaynak Adı"
                                    className="w-full px-4 py-2 mb-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    required
                                />
                                <input
                                    name="url"
                                    type="url"
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 mb-4 bg-slate-900 border border-slate-700 rounded-lg text-slate-100"
                                    required
                                />
                                <div className="flex gap-2">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg"
                                    >
                                        Kaydet
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setShowLinkModal(false)}
                                        className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium py-2 rounded-lg"
                                    >
                                        İptal
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
