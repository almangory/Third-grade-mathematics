import { Lesson, Unit, UserProfile } from '../types';
import { curriculumUnits, diagramConfigs, mockMatchingData, diagramConfigs as allDiagrams, mockMatchingData as allMatches, questionPool } from '../data/curriculumData';
import { Sparkles, Printer, FileText, Download, CheckSquare, Settings, Lock, Unlock, Eye, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useState, useRef, FormEvent, Fragment } from 'react';

interface WorksheetGeneratorProps {
  user: UserProfile;
  favorites: string[];
  isWatermarkRemoved: boolean;
  onUnlockWatermark: (password: string) => boolean;
}

interface GeneratedQuestion {
  id: string;
  type: string;
  text: string;
  correctAnswer?: string;
  options?: string[];
  leftItems?: string[];
  rightItems?: string[];
  diagramImg?: string;
  labels?: { id: string; name: string; x: number; y: number }[];
  
  // High-fidelity Sudanese math structures
  verticalAdd?: { num1: string; num2: string; ans: string }[];
  verticalSub?: { num1: string; num2: string; ans: string }[];
  compareItems?: { num1: string; num2: string; correct: '<' | '>' | '=' }[];
  sortItems?: { raw: string[]; sorted: string[] };
  abacusNum?: { val: string; label: string; digits: string[] }[];
  divGrid?: { divisor: string; dividends: string[]; quotients: string[] };
  multBoxes?: { text: string; correct: string }[];
  mcqs?: { text: string; options: string[]; correct: string }[];
  fills?: { text: string; correct: string }[];
  sideMatch?: { val1: string; equation: string; correct: string }[];
}

export default function WorksheetGenerator({
  user,
  favorites,
  isWatermarkRemoved,
  onUnlockWatermark
}: WorksheetGeneratorProps) {
  // Config states
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['vertical_ops', 'compare_sort', 'abacus_pv', 'mult_div_grids', 'mcq_fill_blank']);
  const [scopeType, setScopeType] = useState<'all' | 'favorites' | 'unit' | 'lesson'>('all');
  const [selectedUnitId, setSelectedUnitId] = useState<string>(curriculumUnits[0].id);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(curriculumUnits[0].lessons[0].id);
  const [pagesCount, setPagesCount] = useState<number>(1);
  const [showAnswers, setShowAnswers] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedPages, setGeneratedPages] = useState<GeneratedQuestion[][]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [realWorldOnly, setRealWorldOnly] = useState<boolean>(false);

  // Password unlock state
  const [password, setPassword] = useState('');
  const [pwdError, setPasswordError] = useState(false);
  const [showPwdForm, setShowPwdForm] = useState(false);

  // References
  const printAreaRef = useRef<HTMLDivElement>(null);

  // Types definitions
  const questionTypes = [
    { id: 'vertical_ops', label: 'العمليات الحسابية الرأسية (جمع وطرح) ➕' },
    { id: 'compare_sort', label: 'المقارنة والترتيب (ضع < > = وترتيب تصاعدي) ⚖️' },
    { id: 'abacus_pv', label: 'التمثيل على المعداد والقيمة المنزلية 🧮' },
    { id: 'mult_div_grids', label: 'جداول الضرب والقسمة بمربعات فارغة ✖️' },
    { id: 'mcq_fill_blank', label: 'أكمل واختيار من متعدد (أ، ب، ج) 📝' }
  ];

  // Helper to get active units / lessons list
  const activeLessons = curriculumUnits.find(u => u.id === selectedUnitId)?.lessons || [];

  // Handle password check
  const handlePasswordSubmit = (e: FormEvent) => {
    e.preventDefault();
    const success = onUnlockWatermark(password);
    if (success) {
      setPassword('');
      setPasswordError(false);
      setShowPwdForm(false);
    } else {
      setPasswordError(true);
    }
  };

  // Worksheet Question Generator Core Engine with STRICT Uniqueness & No Duplications
  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      // Helper to convert standard English numbers to Arabic-Indic digits (Sudanese schools style)
      const toArabicDigits = (numStr: string | number): string => {
        const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return String(numStr).replace(/[0-9]/g, (w) => arabicDigits[parseInt(w)]);
      };

      // Determine allowed units based on selected scope strictly
      const getUnitsInScope = (): string[] => {
        if (scopeType === 'all') {
          return ['unit1', 'unit2', 'unit3', 'unit4', 'unit5', 'unit6'];
        }
        if (scopeType === 'unit') {
          return [selectedUnitId];
        }
        if (scopeType === 'lesson') {
          const matchedUnit = curriculumUnits.find(u => u.lessons.some(l => l.id === selectedLessonId));
          return matchedUnit ? [matchedUnit.id] : ['unit1'];
        }
        if (scopeType === 'favorites') {
          if (favorites.length === 0) return ['unit1'];
          const units = new Set<string>();
          curriculumUnits.forEach(u => {
            if (u.lessons.some(l => favorites.includes(l.id))) {
              units.add(u.id);
            }
          });
          return Array.from(units);
        }
        return ['unit1'];
      };

      const allowedUnits = getUnitsInScope();
      const newPages: GeneratedQuestion[][] = [];
      const usedExercises = new Set<string>();

      // Generate content for each requested A4 page
      for (let p = 0; p < pagesCount; p++) {
        const pageQuestions: GeneratedQuestion[] = [];
        
        // Pick active unit for this page dynamically from allowed units to maintain scope
        const pageUnit = allowedUnits[p % allowedUnits.length] || 'unit1';

        // 1. Vertical Operations
        if (selectedTypes.includes('vertical_ops')) {
          const itemsAdd: { num1: string; num2: string; ans: string }[] = [];
          const itemsSub: { num1: string; num2: string; ans: string }[] = [];

          if (pageUnit === 'unit4') {
            // Fraction Vertical Add/Sub - Dynamic and Non-repeating
            for (let i = 0; i < 2; i++) {
              let d = 7, n1 = 1, n2 = 1, key = "", attempts = 0;
              do {
                d = Math.floor(Math.random() * 6) + 5; // 5 to 10
                n2 = Math.floor(Math.random() * (d - 2)) + 1;
                n1 = Math.floor(Math.random() * (d - n2 - 1)) + 1;
                const sortedNums = [n1, n2].sort().join(',');
                key = `vert_frac_add:${sortedNums}/${d}`;
                attempts++;
              } while (usedExercises.has(key) && attempts < 100);

              usedExercises.add(key);
              itemsAdd.push({
                num1: `${toArabicDigits(n1)}/${toArabicDigits(d)}`,
                num2: `${toArabicDigits(n2)}/${toArabicDigits(d)}`,
                ans: `${toArabicDigits(n1 + n2)}/${toArabicDigits(d)}`
              });
            }

            for (let i = 0; i < 2; i++) {
              let d = 7, n1 = 2, n2 = 1, key = "", attempts = 0;
              do {
                d = Math.floor(Math.random() * 6) + 5; // 5 to 10
                n1 = Math.floor(Math.random() * (d - 2)) + 2; // at least 2
                n2 = Math.floor(Math.random() * (n1 - 1)) + 1; // n2 < n1
                key = `vert_frac_sub:${n1}-${n2}/${d}`;
                attempts++;
              } while (usedExercises.has(key) && attempts < 100);

              usedExercises.add(key);
              itemsSub.push({
                num1: `${toArabicDigits(n1)}/${toArabicDigits(d)}`,
                num2: `${toArabicDigits(n2)}/${toArabicDigits(d)}`,
                ans: `${toArabicDigits(n1 - n2)}/${toArabicDigits(d)}`
              });
            }
          } else {
            // Standard Number Vertical Add/Sub - Dynamic and Non-repeating
            let min = 10, max = 99; // easy
            if (difficulty === 'medium') { min = 100; max = 999; }
            if (difficulty === 'hard') { min = 1000; max = 9999; }

            // Additions
            for (let i = 0; i < 2; i++) {
              let n1 = 0, n2 = 0, key = "", attempts = 0;
              do {
                n1 = Math.floor(Math.random() * (max - min)) + min;
                n2 = Math.floor(Math.random() * (max - min)) + min;
                const sortedNums = [n1, n2].sort().join(',');
                key = `vert_add:${sortedNums}`;
                attempts++;
              } while (usedExercises.has(key) && attempts < 100);
              
              usedExercises.add(key);
              itemsAdd.push({
                num1: toArabicDigits(n1),
                num2: toArabicDigits(n2),
                ans: toArabicDigits(n1 + n2)
              });
            }

            // Subtractions
            for (let i = 0; i < 2; i++) {
              let n1 = 0, n2 = 0, key = "", attempts = 0;
              do {
                n1 = Math.floor(Math.random() * (max - min)) + min;
                n2 = Math.floor(Math.random() * (max - min)) + min;
                if (n1 < n2) { const t = n1; n1 = n2; n2 = t; }
                key = `vert_sub:${n1}-${n2}`;
                attempts++;
              } while (usedExercises.has(key) && attempts < 100);
              
              usedExercises.add(key);
              itemsSub.push({
                num1: toArabicDigits(n1),
                num2: toArabicDigits(n2),
                ans: toArabicDigits(n1 - n2)
              });
            }
          }

          pageQuestions.push({
            id: `q-vert-${p}-${pageUnit}`,
            type: 'vertical_ops',
            text: pageUnit === 'unit4' 
              ? 'أوجد ناتج العمليات الحسابية التالية للكسور رأسياً:' 
              : 'أوجد ناتج العمليات الحسابية التالية رأسياً مع كتابة الحل بخط واضح:',
            verticalAdd: itemsAdd,
            verticalSub: itemsSub,
            correctAnswer: `الجمع: ${itemsAdd.map(x => `${x.num1}+${x.num2}=${x.ans}`).join(' ، ')} | الطرح: ${itemsSub.map(x => `${x.num1}-${x.num2}=${x.ans}`).join(' ، ')}`
          });
        }

        // 2. Compare & Sort
        if (selectedTypes.includes('compare_sort')) {
          const compItems: { num1: string; num2: string; correct: '<' | '>' | '=' }[] = [];
          
          if (pageUnit === 'unit4') {
            // Compare Fractions - Dynamic and Non-repeating
            for (let i = 0; i < 5; i++) {
              let d = 5, n1 = 1, n2 = 1, key = "", attempts = 0;
              do {
                d = Math.floor(Math.random() * 6) + 5; // 5 to 10
                n1 = Math.floor(Math.random() * d) + 1;
                n2 = Math.floor(Math.random() * d) + 1;
                key = `comp_frac:${n1}/${d}_vs_${n2}/${d}`;
                attempts++;
              } while (usedExercises.has(key) && attempts < 100);

              usedExercises.add(key);
              const sign = n1 > n2 ? '>' : n1 < n2 ? '<' : '=';
              compItems.push({
                num1: `${toArabicDigits(n1)}/${toArabicDigits(d)}`,
                num2: `${toArabicDigits(n2)}/${toArabicDigits(d)}`,
                correct: sign
              });
            }
          } else if (pageUnit === 'unit5') {
            // Compare Measurement Units - Dynamic and Non-repeating
            const mTypes = ['inch_foot', 'foot_yard', 'day_hour', 'hour_minute'];
            for (let i = 0; i < 5; i++) {
              let attempts = 0;
              let num1 = "", num2 = "", correct: '<' | '>' | '=' = '=';
              let key = "";
              do {
                const chosenType = mTypes[(i + attempts) % mTypes.length];
                if (chosenType === 'inch_foot') {
                  const ft = Math.floor(Math.random() * 4) + 1; // 1 to 4 ft
                  const inches = ft * 12 + (Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 6 : -6));
                  num1 = `${toArabicDigits(inches)} بوصة`;
                  num2 = `${toArabicDigits(ft)} قدم`;
                  correct = inches > (ft * 12) ? '>' : inches < (ft * 12) ? '<' : '=';
                } else if (chosenType === 'foot_yard') {
                  const yd = Math.floor(Math.random() * 3) + 1; // 1 to 3 yd
                  const ft = yd * 3 + (Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 2 : -1));
                  num1 = `${toArabicDigits(yd)} ياردة`;
                  num2 = `${toArabicDigits(ft)} أقدام`;
                  correct = (yd * 3) > ft ? '>' : (yd * 3) < ft ? '<' : '=';
                } else if (chosenType === 'day_hour') {
                  const day = Math.floor(Math.random() * 2) + 1; // 1 to 2 days
                  const hr = day * 24 + (Math.random() > 0.5 ? 0 : (Math.random() > 0.5 ? 6 : -12));
                  num1 = `${toArabicDigits(hr)} ساعة`;
                  num2 = `${toArabicDigits(day)} يوم`;
                  correct = hr > (day * 24) ? '>' : hr < (day * 24) ? '<' : '=';
                } else {
                  // hour_minute
                  const hr = Math.random() > 0.5 ? 1 : 2; 
                  let mins = hr * 60;
                  if (Math.random() > 0.5) mins += (Math.random() > 0.5 ? 15 : -15);
                  num1 = `${toArabicDigits(mins)} دقيقة`;
                  num2 = hr === 1 ? '١ ساعة' : '٢ ساعة';
                  correct = mins > (hr * 60) ? '>' : mins < (hr * 60) ? '<' : '=';
                }
                key = `comp_meas:${num1}_vs_${num2}`;
                attempts++;
              } while (usedExercises.has(key) && attempts < 100);

              usedExercises.add(key);
              compItems.push({ num1, num2, correct });
            }
          } else {
            // Standard Numbers Comparisons - Dynamic and Non-repeating
            let min = 10, max = 99; // easy
            if (difficulty === 'medium') { min = 100; max = 999; }
            if (difficulty === 'hard') { min = 1000; max = 9999; }

            for (let i = 0; i < 5; i++) {
              let n1 = 0, n2 = 0, key = "", attempts = 0;
              do {
                n1 = Math.floor(Math.random() * (max - min)) + min;
                n2 = Math.floor(Math.random() * (max - min)) + min;
                key = `comp_std:${n1}_vs_${n2}`;
                attempts++;
              } while (usedExercises.has(key) && attempts < 100);

              usedExercises.add(key);
              const sign = n1 > n2 ? '>' : n1 < n2 ? '<' : '=';
              compItems.push({
                num1: toArabicDigits(n1),
                num2: toArabicDigits(n2),
                correct: sign
              });
            }
          }

          // Sort items raw and sorted
          let rawSort: string[] = [];
          let sortedSort: string[] = [];

          if (pageUnit === 'unit4') {
            // Fractions Sort - Dynamic and Non-repeating
            let d = 7, raw: number[] = [], key = "", attempts = 0;
            do {
              d = Math.floor(Math.random() * 4) + 7; // 7, 8, 9, 10
              const nums = new Set<number>();
              while (nums.size < 5) {
                nums.add(Math.floor(Math.random() * (d - 1)) + 1);
              }
              raw = Array.from(nums);
              key = `sort_frac:${d}_[${[...raw].sort().join(',')}]`;
              attempts++;
            } while (usedExercises.has(key) && attempts < 100);

            usedExercises.add(key);
            rawSort = raw.map(x => `${toArabicDigits(x)}/${toArabicDigits(d)}`);
            sortedSort = [...raw].sort((a, b) => a - b).map(x => `${toArabicDigits(x)}/${toArabicDigits(d)}`);
          } else {
            // Standard Numbers Sort - Dynamic and Non-repeating
            let minVal = 10, maxVal = 99;
            if (difficulty === 'medium') { minVal = 100; maxVal = 999; }
            if (difficulty === 'hard') { minVal = 1000; maxVal = 9999; }

            let rawNums: number[] = [], key = "", attempts = 0;
            do {
              const numbersSet = new Set<number>();
              while (numbersSet.size < 5) {
                numbersSet.add(Math.floor(Math.random() * (maxVal - minVal)) + minVal);
              }
              rawNums = Array.from(numbersSet);
              key = `sort_std:[${[...rawNums].sort().join(',')}]`;
              attempts++;
            } while (usedExercises.has(key) && attempts < 100);

            usedExercises.add(key);
            rawSort = rawNums.map(x => toArabicDigits(x));
            sortedSort = [...rawNums].sort((a, b) => a - b).map(x => toArabicDigits(x));
          }

          pageQuestions.push({
            id: `q-comp-${p}-${pageUnit}`,
            type: 'compare_sort',
            text: 'المقارنة والترتيب التصاعدي للأعداد:',
            compareItems: compItems,
            sortItems: {
              raw: rawSort,
              sorted: sortedSort
            },
            correctAnswer: `المقارنة: ${compItems.map(x => `${x.num1} [${x.correct}] ${x.num2}`).join(' ، ')} | الترتيب: ${sortedSort.join(' ➔ ')}`
          });
        }

        // 3. Abacus & Place value
        if (selectedTypes.includes('abacus_pv')) {
          const abNumList: { val: string; label: string; digits: string[] }[] = [];

          if (pageUnit === 'unit4') {
            // Fraction representation (not abacus, but visual circle slices!)
            let val = 'fraction-3-4';
            let label = 'الكسر الممثل هو: ........';
            let digits = ['٣', '٤'];
            
            if (p % 2 !== 0) {
              val = 'fraction-1-2';
              digits = ['١', '٢'];
            }
            abNumList.push({ val, label, digits });
          } else {
            // Generate numbers for abacus - Dynamic and Non-repeating
            let numVal = 0, key = "", attempts = 0;
            do {
              numVal = Math.floor(Math.random() * 899) + 100; // 3-digit
              if (difficulty === 'medium') numVal = Math.floor(Math.random() * 8999) + 1000; // 4-digit
              if (difficulty === 'hard') numVal = Math.floor(Math.random() * 89999) + 10000; // 5-digit
              key = `abacus_num:${numVal}`;
              attempts++;
            } while (usedExercises.has(key) && attempts < 100);

            usedExercises.add(key);
            const arabicVal = toArabicDigits(numVal);
            const digitsArray = String(numVal).split('').map(x => toArabicDigits(x));

            abNumList.push({
              val: arabicVal,
              label: p % 2 === 0 ? 'اكتب الرقم الممثل على المعداد أعلاه:' : 'مثل العدد التالي برسم الخرزات المناسبة على المعداد:',
              digits: digitsArray
            });
          }

          // House values/formulas - Dynamic and Non-repeating Companion Fills
          const fills: { text: string; correct: string }[] = [];
          
          if (pageUnit === 'unit1' || (pageUnit !== 'unit4' && pageUnit !== 'unit1' && Math.random() > 0.5)) {
            // Generate standard place value fill
            let attempts = 0;
            let subKey = "";
            let generatedFill: { text: string; correct: string } = { text: "", correct: "" };
            do {
              const numVal = Math.floor(Math.random() * 8999) + 1000; // 4-digit
              const idx = Math.floor(Math.random() * 4); // index 0 to 3
              const digitStr = String(numVal)[idx];
              const placeNames = ['ألوف', 'مئات', 'عشرات', 'آحاد'];
              const placeValue = placeNames[idx];
              
              generatedFill = {
                text: `القيمة المنزلية للرقم ${toArabicDigits(digitStr)} في العدد ${toArabicDigits(numVal)} هي: ........`,
                correct: placeValue
              };
              subKey = `pv_fill:${digitStr}_in_${numVal}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);
            
            usedExercises.add(subKey);
            fills.push(generatedFill);

            // Standard written form
            attempts = 0;
            do {
              const writtenPool = [
                { text: 'خمسة آلاف وأربعمائة واثنان', correct: '٥٤٠٢' },
                { text: 'سبعة آلاف ومائتان وثلاثون', correct: '٧٢٣٠' },
                { text: 'ألف وثمانمائة وخمسة عشر', correct: '١٨١٥' },
                { text: 'تسعة آلاف وستة', correct: '٩٠٠٦' },
                { text: 'أربعة آلاف وخمسون', correct: '٤٠٥٠' },
                { text: 'ثمانية آلاف ومائة وواحد', correct: '٨١٠١' },
                { text: 'ثلاثة آلاف وسبعمائة وأربعة وثمانون', correct: '٣٧٨٤' },
                { text: 'ستة آلاف وتسعمائة واثنا عشر', correct: '٦٩١٢' }
              ];
              const chosen = writtenPool[Math.floor(Math.random() * writtenPool.length)];
              generatedFill = {
                text: `الصيغة القياسية للعدد (${chosen.text}) هي: ........`,
                correct: chosen.correct
              };
              subKey = `written_fill:${chosen.correct}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);

            usedExercises.add(subKey);
            fills.push(generatedFill);
          } else if (pageUnit === 'unit4') {
            // Fraction fill
            let subKey = "";
            let generatedFill: { text: string; correct: string } = { text: "", correct: "" };
            let numVal1 = 3, numVal2 = 4;
            let attempts = 0;
            do {
              numVal2 = Math.floor(Math.random() * 6) + 4; // 4 to 9
              numVal1 = Math.floor(Math.random() * (numVal2 - 1)) + 1;
              const typeChoice = Math.random() > 0.5 ? 'numerator' : 'denominator';
              if (typeChoice === 'numerator') {
                generatedFill = {
                  text: `في الكسر الاعتيادي ${toArabicDigits(numVal1)}/${toArabicDigits(numVal2)}، يسمى الرقم ${toArabicDigits(numVal1)} بـ ........`,
                  correct: 'البسط'
                };
              } else {
                generatedFill = {
                  text: `في الكسر الاعتيادي ${toArabicDigits(numVal1)}/${toArabicDigits(numVal2)}، يسمى الرقم ${toArabicDigits(numVal2)} بـ ........`,
                  correct: 'المقام'
                };
              }
              subKey = `frac_fill:${numVal1}/${numVal2}_${typeChoice}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);

            usedExercises.add(subKey);
            fills.push(generatedFill);

            // Second fraction fill
            attempts = 0;
            do {
              const terms = [
                { num: 1, den: 2, name: 'نصف' },
                { num: 1, den: 4, name: 'ربع' },
                { num: 1, den: 3, name: 'ثلث' },
                { num: 1, den: 5, name: 'خمس' },
                { num: 3, den: 4, name: 'ثلاثة أرباع' }
              ];
              const chosen = terms[Math.floor(Math.random() * terms.length)];
              generatedFill = {
                text: `الكسر الذي بسطه ${toArabicDigits(chosen.num)} ومقامه ${toArabicDigits(chosen.den)} يسمى ........`,
                correct: chosen.name
              };
              subKey = `frac_name_fill:${chosen.num}/${chosen.den}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);

            usedExercises.add(subKey);
            fills.push(generatedFill);
          } else {
            // General or other units fills
            let subKey = "";
            let generatedFill: { text: string; correct: string } = { text: "", correct: "" };
            let attempts = 0;
            do {
              const stdPool = [
                { text: 'العدد الزوجي الذي يسبق العدد ١٠ مباشرة هو: ........', correct: '٨', key: 'prev_10' },
                { text: 'العدد الفردي الذي يلي العدد ٩ مباشرة هو: ........', correct: '١١', key: 'next_9' },
                { text: 'العدد الزوجي الذي يلي العدد ١٢ مباشرة هو: ........', correct: '١٤', key: 'next_12' },
                { text: 'أصغر عدد مكون من ثلاثة أرقام مختلفة هو: ........', correct: '١٠٢', key: 'smallest_3' },
                { text: 'أكبر عدد مكون من ثلاثة أرقام هو: ........', correct: '٩٩٩', key: 'largest_3' }
              ];
              const chosen = stdPool[Math.floor(Math.random() * stdPool.length)];
              generatedFill = { text: chosen.text, correct: chosen.correct };
              subKey = `std_misc_fill:${chosen.key}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);

            usedExercises.add(subKey);
            fills.push(generatedFill);

            // Second one
            attempts = 0;
            do {
              const stdPool2 = [
                { text: 'القيمة المنزلية للرقم ٧ في العدد ٧٥٢ هي: ........', correct: 'مئات', key: '7_in_752' },
                { text: 'العدد الزوجي الذي يسبق العدد ٢٠ مباشرة هو: ........', correct: '١٨', key: 'prev_20' },
                { text: 'العدد الفردي الذي يلي العدد ١٥ مباشرة هو: ........', correct: '١٧', key: 'next_15' }
              ];
              const chosen = stdPool2[Math.floor(Math.random() * stdPool2.length)];
              generatedFill = { text: chosen.text, correct: chosen.correct };
              subKey = `std_misc_fill2:${chosen.key}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);

            usedExercises.add(subKey);
            fills.push(generatedFill);
          }

          pageQuestions.push({
            id: `q-abacus-${p}-${pageUnit}`,
            type: 'abacus_pv',
            text: pageUnit === 'unit4' ? 'أجب عن الأسئلة الهندسية والكسور المظللة التالية:' : 'التمثيل على المعداد الحسابي وتحديد المنازل والقيم المنزلية:',
            abacusNum: abNumList,
            fills: fills,
            correctAnswer: `المعداد: ${abNumList.map(x => x.val).join(' ، ')} | الفراغات: ${fills.map(x => `${x.text} ➔ [${x.correct}]`).join(' | ')}`
          });
        }

        // 4. Multiplication & Division Grids
        if (selectedTypes.includes('mult_div_grids')) {
          const multItems: { text: string; correct: string }[] = [];
          const sideMatchList: { val1: string; equation: string; correct: string }[] = [];

          // Generate empty multiplier boxes - Dynamic and Non-repeating
          let multTable = 3;
          let tableAttempts = 0;
          do {
            if (difficulty === 'easy') multTable = Math.floor(Math.random() * 3) + 2; // 2, 3, 4
            else if (difficulty === 'medium') multTable = Math.floor(Math.random() * 3) + 5; // 5, 6, 7
            else multTable = Math.floor(Math.random() * 3) + 8; // 8, 9, 10
            tableAttempts++;
          } while (usedExercises.has(`mult_table:${multTable}`) && tableAttempts < 50);
          usedExercises.add(`mult_table:${multTable}`);

          for (let i = 0; i < 4; i++) {
            let randFactor = 1;
            let styleNum = 0;
            let subKey = "";
            let attempts = 0;
            do {
              randFactor = Math.floor(Math.random() * 9) + 1;
              styleNum = Math.floor(Math.random() * 3); // 0, 1, 2
              subKey = `mult_box:${multTable}x${randFactor}_s${styleNum}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);

            usedExercises.add(subKey);

            if (styleNum === 0) {
              multItems.push({
                text: `[   ] = ${toArabicDigits(multTable)} × ${toArabicDigits(randFactor)}`,
                correct: toArabicDigits(multTable * randFactor)
              });
            } else if (styleNum === 1) {
              multItems.push({
                text: `${toArabicDigits(multTable * randFactor)} = ${toArabicDigits(multTable)} × [   ]`,
                correct: toArabicDigits(randFactor)
              });
            } else {
              multItems.push({
                text: `${toArabicDigits(multTable)} × [   ] = ${toArabicDigits(multTable * randFactor)}`,
                correct: toArabicDigits(randFactor)
              });
            }
          }

          // Division Grid Generator - Dynamic and Non-repeating
          let divTable = 7;
          let divAttempts = 0;
          do {
            if (difficulty === 'easy') divTable = Math.random() > 0.5 ? 2 : 3;
            else if (difficulty === 'medium') divTable = Math.random() > 0.5 ? 4 : 5;
            else divTable = Math.random() > 0.5 ? 8 : 9;
            divAttempts++;
          } while (usedExercises.has(`div_table:${divTable}`) && divAttempts < 50);
          usedExercises.add(`div_table:${divTable}`);

          // Pick 6 random non-repeating quotients to make it unique and dynamic
          const possibleQuotients = new Set<number>();
          while (possibleQuotients.size < 6) {
            possibleQuotients.add(Math.floor(Math.random() * 9) + 1); // quotients 1 to 9
          }
          const quotientsRaw = Array.from(possibleQuotients);
          const dividendsRaw = quotientsRaw.map(x => x * divTable);

          const divGridData = {
            divisor: `÷ ${toArabicDigits(divTable)}`,
            dividends: dividendsRaw.map(x => toArabicDigits(x)),
            quotients: quotientsRaw.map(x => toArabicDigits(x))
          };

          // Side Choices Box - Dynamic and Non-repeating
          for (let i = 0; i < 3; i++) {
            let t = 2, f = 2, ans = 4;
            let subKey = "";
            let attempts = 0;
            do {
              t = Math.floor(Math.random() * 8) + 2; // 2 to 9
              f = Math.floor(Math.random() * 8) + 2; // 2 to 9
              ans = t * f;
              subKey = `side_match:${t}x${f}`;
              attempts++;
            } while (usedExercises.has(subKey) && attempts < 100);

            usedExercises.add(subKey);

            // Create choices string: ans, and two distractors
            const d1 = ans + (Math.random() > 0.5 ? 9 : -9) || 12;
            const d2 = ans + (Math.random() > 0.5 ? 5 : -5) || 15;
            const choices = [ans, d1, d2].map(x => toArabicDigits(Math.abs(x))).sort().join(' / ');

            sideMatchList.push({
              val1: choices,
              equation: `[   ] = ${toArabicDigits(t)} × ${toArabicDigits(f)}`,
              correct: toArabicDigits(ans)
            });
          }

          pageQuestions.push({
            id: `q-multdiv-${p}-${pageUnit}`,
            type: 'mult_div_grids',
            text: 'جد ناتج ما يلي مستعيناً بمربعات الضرب وجدول القسمة الدوري:',
            multBoxes: multItems,
            divGrid: divGridData,
            sideMatch: sideMatchList,
            correctAnswer: `الضرب: ${multItems.map(x => `${x.text} [${x.correct}]`).join(' ، ')} | القسمة: المقسوم عليه (${divGridData.divisor})، خارج القسمة (${divGridData.quotients.join(' ، ')}) | الصندوق الجانبي: ${sideMatchList.map(x => `${x.equation} ➔ ${x.correct}`).join(' ، ')}`
          });
        }

        // 5. MCQ & Fill Blank
        if (selectedTypes.includes('mcq_fill_blank')) {
          const mcqList: { text: string; options: string[]; correct: string }[] = [];
          const fillList: { text: string; correct: string }[] = [];

          if (pageUnit === 'unit4') {
            // Pool of fraction MCQs - Dynamic and Non-repeating Selection
            const poolMCQ = [
              { text: 'الكسر الذي يمثل ربع هو:', options: ['١/٤', '١/٢', '٣/٤'], correct: 'أ' },
              { text: 'الرقم الذي يمثل المقام في الكسر ٣/٥ هو:', options: ['٣', '٥', '٨'], correct: 'ب' },
              { text: 'الكسران متساويا المقام هما:', options: ['١/٤ و ١/٥', '٢/٧ و ٥/٧', '١/٢ و ٢/٣'], correct: 'ب' },
              { text: 'الكسر الذي يمثل نصف هو:', options: ['١/٣', '٢/٤', '٣/٤'], correct: 'ب' },
              { text: 'الرقم الذي يمثل البسط في الكسر ٤/٩ هو:', options: ['٤', '٩', '١٣'], correct: 'أ' }
            ];
            
            let selectedCount = 0;
            let attempts = 0;
            while (selectedCount < 3 && attempts < 100) {
              const item = poolMCQ[Math.floor(Math.random() * poolMCQ.length)];
              const key = `mcq_unit4:${item.text}`;
              if (!usedExercises.has(key)) {
                usedExercises.add(key);
                mcqList.push(item);
                selectedCount++;
              }
              attempts++;
            }
            if (mcqList.length < 3) {
              poolMCQ.forEach(item => {
                if (mcqList.length < 3 && !mcqList.some(x => x.text === item.text)) mcqList.push(item);
              });
            }

            // Pool of fraction Fills - Dynamic and Non-repeating Selection
            const poolFills = [
              { text: 'في الكسر الاعتيادي ٣/٤ يسمى الرقم ٣ بـ ............', correct: 'البسط' },
              { text: 'الكسر الاعتيادي الذي بسطه ٢ ومقامه ٧ يكتب: ............', correct: '٢/٧' },
              { text: 'الكسر الذي يعبر عن الجزء الواحد من خمسة أجزاء متساوية هو: ............', correct: '١/٥' },
              { text: 'في الكسر الاعتيادي ٥/٨ يسمى الرقم ٨ بـ ............', correct: 'المقام' },
              { text: 'الكسر الذي بسطه ٣ ومقامه ١٠ يكتب: ............', correct: '٣/١٠' }
            ];

            let fillCount = 0;
            attempts = 0;
            while (fillCount < 3 && attempts < 100) {
              const item = poolFills[Math.floor(Math.random() * poolFills.length)];
              const key = `fill_unit4:${item.text}`;
              if (!usedExercises.has(key)) {
                usedExercises.add(key);
                fillList.push(item);
                fillCount++;
              }
              attempts++;
            }
            if (fillList.length < 3) {
              poolFills.forEach(item => {
                if (fillList.length < 3 && !fillList.some(x => x.text === item.text)) fillList.push(item);
              });
            }

          } else if (pageUnit === 'unit5') {
            // Pool of measurement / time MCQs - Dynamic and Non-repeating Selection
            const poolMCQ = [
              { text: 'اليوم الكامل يحتوي على:', options: ['١٢ ساعة', '٢٤ ساعة', '٣٠ ساعة'], correct: 'ب' },
              { text: 'القدم الواحد يساوي بالبوصة:', options: ['٦ بوصات', '١٠ بوصات', '١٢ بوصة'], correct: 'ج' },
              { text: 'ربع الساعة يساوي كم دقيقة؟', options: ['١٥ دقيقة', '٣٠ دقيقة', '٤٥ دقيقة'], correct: 'أ' },
              { text: 'الياردة الواحدة تساوي بالأقدام:', options: ['٢ قدم', '٣ أقدام', '٤ أقدام'], correct: 'ب' },
              { text: 'نصف اليوم يساوي كم ساعة؟', options: ['٦ ساعات', '١٢ ساعة', '١٨ ساعة'], correct: 'ب' }
            ];

            let selectedCount = 0;
            let attempts = 0;
            while (selectedCount < 3 && attempts < 100) {
              const item = poolMCQ[Math.floor(Math.random() * poolMCQ.length)];
              const key = `mcq_unit5:${item.text}`;
              if (!usedExercises.has(key)) {
                usedExercises.add(key);
                mcqList.push(item);
                selectedCount++;
              }
              attempts++;
            }
            if (mcqList.length < 3) {
              poolMCQ.forEach(item => {
                if (mcqList.length < 3 && !mcqList.some(x => x.text === item.text)) mcqList.push(item);
              });
            }

            // Pool of measurement / time Fills - Dynamic and Non-repeating Selection
            const poolFills = [
              { text: 'نصف الساعة يحتوي على ............ دقيقة.', correct: '٣٠' },
              { text: 'الياردة الواحدة تحتوي على ............ أقدام.', correct: '٣' },
              { text: 'عقرب الساعات في الساعة هو العقرب ............', correct: 'القصير' },
              { text: 'اليوم الكامل يحتوي على ............ ساعة.', correct: '٢٤' },
              { text: 'القدم الواحد يحتوي على ............ بوصة.', correct: '١٢' },
              { text: 'عقرب الدقائق في الساعة هو العقرب ............', correct: 'الطويل' }
            ];

            let fillCount = 0;
            attempts = 0;
            while (fillCount < 3 && attempts < 100) {
              const item = poolFills[Math.floor(Math.random() * poolFills.length)];
              const key = `fill_unit5:${item.text}`;
              if (!usedExercises.has(key)) {
                usedExercises.add(key);
                fillList.push(item);
                fillCount++;
              }
              attempts++;
            }
            if (fillList.length < 3) {
              poolFills.forEach(item => {
                if (fillList.length < 3 && !fillList.some(x => x.text === item.text)) fillList.push(item);
              });
            }

          } else {
            // General MCQs - Dynamic and Non-repeating Selection
            const poolMCQ = [
              { text: 'العدد اثنا عشر ألفاً وثلاثمائة يكتب بالأرقام:', options: ['١٢٥٠٠', '١٢٣٠٠', '١٠٥٠٠'], correct: 'ب' },
              { text: 'ميز العدد الفردي بين الأعداد التالية:', options: ['١٠٨', '١١٠', '١٠١'], correct: 'ج' },
              { text: 'العدد ١٨ يقبل القسمة على:', options: ['٥', '٢', '١٠'], correct: 'ب' },
              { text: 'ميز العدد الزوجي بين الأعداد التالية:', options: ['١٤٣', '٢٥٦', '٧٨٩'], correct: 'ب' },
              { text: 'العدد الذي يقبل القسمة على ٥ و ١٠ معاً هو الذي رقم آحاده:', options: ['٥', '٠', '٢'], correct: 'ب' }
            ];

            let selectedCount = 0;
            let attempts = 0;
            while (selectedCount < 3 && attempts < 100) {
              const item = poolMCQ[Math.floor(Math.random() * poolMCQ.length)];
              const key = `mcq_general:${item.text}`;
              if (!usedExercises.has(key)) {
                usedExercises.add(key);
                mcqList.push(item);
                selectedCount++;
              }
              attempts++;
            }
            if (mcqList.length < 3) {
              poolMCQ.forEach(item => {
                if (mcqList.length < 3 && !mcqList.some(x => x.text === item.text)) mcqList.push(item);
              });
            }

            // General Fills - Dynamic and Non-repeating Selection
            const poolFills = [
              { text: 'عدد زوجي + عدد زوجي = ............', correct: 'عدد زوجي' },
              { text: 'إذا كان رقم الآحاد صفراً فإن العدد يقبل القسمة على ............', correct: '٥ أو ١٠' },
              { text: 'يقبل العدد القسمة على ٢ إذا كان رقم آحاده عدداً ............', correct: 'زوجياً' },
              { text: 'عدد فردي + عدد فردي = ............', correct: 'عدد زوجي' },
              { text: 'العدد الزوجي الذي يسبق العدد ٢ مباشرة هو ............', correct: 'صفر' }
            ];

            let fillCount = 0;
            attempts = 0;
            while (fillCount < 3 && attempts < 100) {
              const item = poolFills[Math.floor(Math.random() * poolFills.length)];
              const key = `fill_general:${item.text}`;
              if (!usedExercises.has(key)) {
                usedExercises.add(key);
                fillList.push(item);
                fillCount++;
              }
              attempts++;
            }
            if (fillList.length < 3) {
              poolFills.forEach(item => {
                if (fillList.length < 3 && !fillList.some(x => x.text === item.text)) fillList.push(item);
              });
            }
          }

          pageQuestions.push({
            id: `q-mcqfill-${p}-${pageUnit}`,
            type: 'mcq_fill_blank',
            text: 'أكمل العبارات التالية واختر الإجابة الصحيحة مما يلي:',
            mcqs: mcqList,
            fills: fillList,
            correctAnswer: `الخيارات: ${mcqList.map((x, i) => `${i+1}. [${x.correct}]`).join(' ، ')} | الفراغات: ${fillList.map((x, i) => `${i+1}. [${x.correct}]`).join(' ، ')}`
          });
        }

        newPages.push(pageQuestions);
      }

      setGeneratedPages(newPages);
      setIsGenerating(false);
    }, 1000);
  };

  // Run initial generation on component mount
  useState(() => {
    handleGenerate();
  });

  // Printer handler
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-6 p-6 font-sans select-none" dir="rtl" id="worksheets-generator-tab">
      {/* Control Panel: Left (or Right depending on RTL) side */}
      <div className="w-full lg:w-80 bg-white rounded-3xl p-5 shadow-md border-b-4 border-gray-100 space-y-5 h-fit">
        <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
          <div className="p-2 bg-green-100 text-green-600 rounded-xl">
            <Settings className="w-5 h-5" />
          </div>
          <h3 className="text-base font-black text-gray-800">إعدادات توليد أوراق العمل</h3>
        </div>

        {/* 1. Select Question Types */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 uppercase tracking-wider block">أنواع الأسئلة المطلوبة:</label>
          <div className="space-y-2">
            {questionTypes.map((type) => {
              const checked = selectedTypes.includes(type.id);
              return (
                <label
                  key={type.id}
                  className={`flex items-center gap-2.5 p-3 bg-gray-50 border-2 rounded-xl text-xs font-black cursor-pointer transition-all ${
                    checked ? 'border-green-400 bg-green-50/20 text-green-800' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => {
                      if (checked) {
                        setSelectedTypes(selectedTypes.filter(id => id !== type.id));
                      } else {
                        setSelectedTypes([...selectedTypes, type.id]);
                      }
                    }}
                    className="accent-green-500 w-4 h-4 rounded"
                  />
                  <span>{type.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 2. Select Scope */}
        <div className="space-y-2">
          <label className="text-xs font-black text-gray-400 block">نطاق المنهج الدراسي للاختبار:</label>
          <select
            value={scopeType}
            onChange={(e: any) => setScopeType(e.target.value)}
            className="w-full p-3 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none focus:border-green-400"
          >
            <option value="all">كامل المنهج الدراسي السوداني</option>
            <option value="favorites">من دروسي المفضلة فقط ({favorites.length})</option>
            <option value="unit">من وحدة دراسية كاملة</option>
            <option value="lesson">من درس واحد محدد</option>
          </select>
        </div>

        {/* Conditional scope selects */}
        {scopeType === 'unit' && (
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 block">اختر الوحدة الدراسية:</label>
            <select
              value={selectedUnitId}
              onChange={(e) => setSelectedUnitId(e.target.value)}
              className="w-full p-2.5 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none"
            >
              {curriculumUnits.map(u => (
                <option key={u.id} value={u.id}>{u.title}</option>
              ))}
            </select>
          </div>
        )}

        {scopeType === 'lesson' && (
          <div className="space-y-2.5">
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">اختر الوحدة أولاً:</label>
              <select
                value={selectedUnitId}
                onChange={(e) => {
                  setSelectedUnitId(e.target.value);
                  const firstLesson = curriculumUnits.find(u => u.id === e.target.value)?.lessons[0].id;
                  if (firstLesson) setSelectedLessonId(firstLesson);
                }}
                className="w-full p-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none"
              >
                {curriculumUnits.map(u => (
                  <option key={u.id} value={u.id}>{u.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">اختر الدرس الحقيقي:</label>
              <select
                value={selectedLessonId}
                onChange={(e) => setSelectedLessonId(e.target.value)}
                className="w-full p-2 bg-gray-50 border-2 border-gray-100 rounded-xl text-xs font-bold outline-none"
              >
                {activeLessons.map(l => (
                  <option key={l.id} value={l.id}>{l.title}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* New controls: Difficulty & Real World Toggle */}
        <div className="space-y-3 p-3 bg-amber-50/50 border border-amber-200/50 rounded-2xl">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-amber-900 block">درجة صعوبة المسائل في الأوراق:</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <button
                  type="button"
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`py-1.5 px-1 rounded-xl text-[10px] font-black transition-all cursor-pointer border ${
                    difficulty === level
                      ? level === 'easy'
                        ? 'border-green-500 bg-green-500 text-white shadow-sm'
                        : level === 'medium'
                        ? 'border-amber-500 bg-amber-500 text-white shadow-sm'
                        : 'border-red-500 bg-red-500 text-white shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level === 'easy' ? '🟢 سهل' : level === 'medium' ? '🟡 متوسط' : '🔴 صعب'}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-[10px] font-black text-amber-950 cursor-pointer">
            <input
              type="checkbox"
              checked={realWorldOnly}
              onChange={() => setRealWorldOnly(!realWorldOnly)}
              className="accent-amber-600 w-3.5 h-3.5 rounded"
            />
            <span>توليد مسائل من واقع الحياة اليومية فقط 🌴</span>
          </label>
        </div>

        {/* 3. Pages Count Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-black text-gray-400 block">
            <span>عدد الصفحات المطلوبة (A4):</span>
            <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded-md font-bold">{pagesCount} / 20</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPagesCount(prev => Math.max(1, prev - 1))}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-xl font-black text-lg transition-all cursor-pointer"
            >
              -
            </button>
            <input
              type="range"
              min="1"
              max="20"
              value={pagesCount}
              onChange={(e) => setPagesCount(parseInt(e.target.value))}
              className="flex-1 accent-green-500 cursor-pointer h-2 bg-gray-200 rounded-lg"
            />
            <button
              onClick={() => setPagesCount(prev => Math.min(20, prev + 1))}
              className="w-10 h-10 bg-gray-100 hover:bg-gray-200 active:scale-95 rounded-xl font-black text-lg transition-all cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* 4. Options */}
        <div className="pt-2">
          <label className="flex items-center gap-2 p-2 text-xs font-bold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={showAnswers}
              onChange={() => setShowAnswers(!showAnswers)}
              className="accent-green-500 w-4 h-4 rounded"
            />
            <span>تضمين ورقة إجابات نموذجية للمعلمين</span>
          </label>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || selectedTypes.length === 0}
          className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-md disabled:opacity-50 cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          <span>{isGenerating ? 'جاري التوليد والتحضير...' : 'تحديث وتوليد الأوراق 🔄'}</span>
        </button>

        {/* 5. Watermark Unlock Shortcut */}
        <div className="border-t border-gray-100 pt-4 text-center">
          {isWatermarkRemoved ? (
            <div className="bg-green-50 border border-green-200 text-green-700 p-3 rounded-2xl text-xs font-bold flex items-center gap-1.5 justify-center">
              <Unlock className="w-4 h-4" />
              <span>تمت إزالة العلامة المائية بنجاح! ✅</span>
            </div>
          ) : (
            <button
              onClick={() => setShowPwdForm(!showPwdForm)}
              className="text-xs text-gray-400 hover:text-amber-500 font-bold underline transition-colors cursor-pointer"
            >
              هل تريد إزالة العلامة المائية؟ (للمعلمين فقط)
            </button>
          )}

          {showPwdForm && !isWatermarkRemoved && (
            <form onSubmit={handlePasswordSubmit} className="mt-3 space-y-2 bg-gray-50 border border-gray-100 p-3 rounded-2xl">
              <input
                type="password"
                placeholder="أدخل الرمز السري لإزالة المائية"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setPasswordError(false);
                }}
                className={`w-full p-2 bg-white border-2 rounded-lg text-xs text-center font-mono outline-none ${
                  pwdError ? 'border-red-300 bg-red-50' : 'border-gray-200 focus:border-amber-400'
                }`}
              />
              {pwdError && (
                <p className="text-[10px] text-red-500 font-bold">الرمز السري غير صحيح!</p>
              )}
              <button
                type="submit"
                className="w-full bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-1.5 rounded-lg text-xs cursor-pointer transition-colors"
              >
                تأكيد الرمز
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Preview Area: Right (or Left) side showing A4 sheets */}
      <div className="sudan-print-pages-wrapper flex-1 flex flex-col gap-4">
        {/* Actions above the A4 pages */}
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="text-right">
            <h4 className="text-sm font-black text-gray-800">معاينة المستند المولد (A4)</h4>
            <p className="text-[11px] text-gray-400 font-bold mt-0.5">راجع أوراق العمل قبل طباعتها للطلاب</p>
          </div>
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-md hover:shadow-lg active:scale-95 transition-all flex items-center gap-2 cursor-pointer text-sm"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة أو حفظ كـ PDF 🖨️</span>
          </button>
        </div>

        {/* Simulated A4 pages container */}
        <div
          ref={printAreaRef}
          className="sudan-print-pages-container flex-1 space-y-8 overflow-y-auto max-h-[600px] p-4 bg-gray-100 rounded-3xl border border-gray-200/50 shadow-inner print:p-0 print:m-0 print:overflow-visible print:bg-white print:max-h-none"
        >
          {generatedPages.map((page, pIdx) => (
            <Fragment key={pIdx}>
              <div
                className="relative w-full max-w-[800px] min-h-[1130px] mx-auto bg-white p-12 shadow-xl border-t-[8px] border-green-500 font-sans text-right flex flex-col justify-between page-break-after printable-page-a4"
                dir="rtl"
                style={{ aspectRatio: '1/1.4142' }} // exact A4 aspect ratio
              >
              {/* WATERMARK ELEMENT */}
              {!isWatermarkRemoved && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 opacity-[0.04] watermark-container">
                  <div className="text-center transform -rotate-45 font-sans font-black text-4xl whitespace-nowrap space-y-4">
                    <p>نقلة للمناهج الإلكترونية</p>
                    <p>نقلة للمناهج الإلكترونية</p>
                    <p>نقلة للمناهج الإلكترونية</p>
                    <p>نقلة للمناهج الإلكترونية</p>
                  </div>
                </div>
              )}

              {/* Sheet Header */}
              <div className="border-b-4 border-double border-green-300 pb-4 mb-6 z-10 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-1 text-green-600 text-xs font-black">
                    <FileText className="w-4 h-4" />
                    <span>أوراق العمل التفاعلية - الصف الثالث الابتدائي</span>
                  </div>
                  <h2 className="text-xl font-black text-gray-800">مادة الرياضيات • ورقة العمل رقم ({pIdx + 1})</h2>
                  <p className="text-[10px] text-gray-400 font-bold uppercase">جمهورية السودان - وزارة التربية والتعليم</p>
                </div>
                {/* Logo placeholder */}
                <div className="text-left">
                  <p className="text-[10px] text-gray-400 font-bold font-mono">التاريخ: ___ / ___ / 2026 م</p>
                  <p className="text-[10px] text-gray-400 font-bold font-mono mt-1">الاسم: ___________________</p>
                </div>
              </div>

              {/* Questions Area */}
              <div className="flex-1 space-y-8 z-10">
                {page.map((q, qIdx) => (
                  <div key={q.id} className="space-y-3 pb-6 border-b border-dashed border-gray-100">
                    <h3 className="font-black text-base text-gray-800">
                      السؤال ({qIdx + 1}): <span className="font-sans font-bold text-blue-950">{q.text}</span>
                    </h3>

                    {/* 1. Vertical Operations Rendering */}
                    {q.type === 'vertical_ops' && (
                      <div className="grid grid-cols-2 gap-8 pr-4">
                        {/* Addition Column */}
                        <div className="space-y-4">
                          <p className="text-xs text-gray-500 font-bold border-r-2 border-green-500 pr-2">أولاً: أوجد ناتج الجمع رأسياً:</p>
                          <div className="flex justify-around gap-4">
                            {q.verticalAdd?.map((item, idx) => (
                              <div key={idx} className="flex flex-col items-end font-mono font-bold text-lg border-2 border-gray-100 p-4 rounded-xl w-24 bg-gray-50/50 shadow-sm">
                                <span className="tracking-widest">{item.num1}</span>
                                <span className="tracking-widest border-b-2 border-gray-400 pb-1 w-full text-right flex justify-between">
                                  <span>+</span>
                                  <span>{item.num2}</span>
                                </span>
                                <span className="h-6 text-green-600 pt-1 font-sans text-sm font-black">
                                  {showAnswers ? item.ans : '..........'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Subtraction Column */}
                        <div className="space-y-4">
                          <p className="text-xs text-gray-500 font-bold border-r-2 border-red-500 pr-2">ثانياً: أوجد ناتج الطرح رأسياً:</p>
                          <div className="flex justify-around gap-4">
                            {q.verticalSub?.map((item, idx) => (
                              <div key={idx} className="flex flex-col items-end font-mono font-bold text-lg border-2 border-gray-100 p-4 rounded-xl w-24 bg-gray-50/50 shadow-sm">
                                <span className="tracking-widest">{item.num1}</span>
                                <span className="tracking-widest border-b-2 border-gray-400 pb-1 w-full text-right flex justify-between">
                                  <span>-</span>
                                  <span>{item.num2}</span>
                                </span>
                                <span className="h-6 text-green-600 pt-1 font-sans text-sm font-black">
                                  {showAnswers ? item.ans : '..........'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 2. Compare & Sort Rendering */}
                    {q.type === 'compare_sort' && (
                      <div className="space-y-6 pr-4">
                        <div className="grid grid-cols-2 gap-x-12 gap-y-3">
                          {q.compareItems?.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-sm font-bold p-1">
                              <span className="font-mono text-base">{item.num1}</span>
                              <span className="w-12 h-8 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center font-black text-blue-600 text-lg bg-white">
                                {showAnswers ? item.correct : ''}
                              </span>
                              <span className="font-mono text-base">{item.num2}</span>
                            </div>
                          ))}
                        </div>
                        {q.sortItems && (
                          <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-xl space-y-2">
                            <p className="text-xs text-blue-800 font-black">رتّب الأعداد التالية ترتيباً تصاعدياً (من الأصغر للأكبر):</p>
                            <div className="flex justify-center gap-3 py-1">
                              {q.sortItems.raw.map((n, idx) => (
                                <span key={idx} className="px-2.5 py-1 bg-white border border-gray-200 rounded-lg font-mono font-bold text-sm shadow-sm">{n}</span>
                              ))}
                            </div>
                            <p className="text-xs text-gray-500 font-bold pt-1">
                              الترتيب الصحيح: <span className="font-mono text-blue-700 font-black">{showAnswers ? q.sortItems.sorted.join(' ➔ ') : '........ ➔ ........ ➔ ........ ➔ ........ ➔ ........'}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* 3. Abacus & Place Value Rendering */}
                    {q.type === 'abacus_pv' && (
                      <div className="space-y-6 pr-4">
                        {q.abacusNum?.map((item, idx) => {
                          const isFraction = item.val.includes('fraction');
                          return (
                            <div key={idx} className="flex flex-col md:flex-row items-center gap-6 p-4 bg-gray-50/50 rounded-2xl border border-gray-100">
                              {isFraction ? (
                                /* Fraction Circle Slices */
                                <div className="relative w-28 h-28 flex items-center justify-center">
                                  <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                                    {item.val === 'fraction-3-4' ? (
                                      <>
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="188.4 251.2" />
                                        <path d="M 50 10 L 50 90 M 10 50 L 90 50" stroke="#ffffff" strokeWidth="1.5" />
                                      </>
                                    ) : (
                                      <>
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="125.6 251.2" strokeDashoffset="0" />
                                        <path d="M 50 10 L 50 90" stroke="#ffffff" strokeWidth="1.5" />
                                      </>
                                    )}
                                  </svg>
                                </div>
                              ) : (
                                /* Abacus Wire Poles & Beads */
                                <div className="flex flex-col items-center bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                  <div className="flex gap-4 items-end h-24 pb-1 px-4 relative">
                                    {/* Horizontal Wire bar */}
                                    <div className="absolute bottom-1 left-2 right-2 h-1 bg-amber-800 rounded"></div>
                                    
                                    {/* Wire Rods with customized colors */}
                                    {item.digits.map((digit, dIdx) => {
                                      const mapping: Record<string, number> = { '٠':0, '١':1, '٢':2, '٣':3, '٤':4, '٥':5, '٦':6, '٧':7, '٨':8, '٩':9 };
                                      const count = mapping[digit] || 0;
                                      const name = dIdx === 0 ? 'ألوف' : dIdx === 1 ? 'مئات' : dIdx === 2 ? 'عشرات' : 'آحاد';
                                      return (
                                        <div key={dIdx} className="flex flex-col-reverse items-center w-8 h-full relative">
                                          <div className="w-1 h-20 bg-slate-400 absolute bottom-1 rounded-full"></div>
                                          
                                          {/* Colorful Beads stack */}
                                          <div className="flex flex-col-reverse gap-0.5 z-10 bottom-1 absolute">
                                            {Array.from({ length: count }).map((_, bIdx) => (
                                              <span key={bIdx} className="w-5 h-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border border-blue-400 block shadow-sm"></span>
                                            ))}
                                          </div>
                                          
                                          <span className="text-[9px] text-gray-400 font-bold absolute -top-4">{name}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              <div className="flex-1 space-y-2">
                                <p className="text-sm font-black text-gray-700">{item.label}</p>
                                <div className="text-xs font-bold text-gray-500">
                                  الإجابة الصحيحة: <span className="font-mono text-green-700 font-black">{showAnswers ? item.val : '....................'}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Companion Place-Value/Equations Fills */}
                        <div className="space-y-2 pr-2">
                          {q.fills?.map((f, fIdx) => (
                            <div key={fIdx} className="text-sm font-bold text-gray-700 flex items-center justify-between">
                              <span>({fIdx + 1}) {f.text}</span>
                              {showAnswers && <span className="text-green-700 font-black bg-green-50 px-2 py-0.5 rounded border border-green-200">[{f.correct}]</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. Multiplication & Division Grids Rendering */}
                    {q.type === 'mult_div_grids' && (
                      <div className="space-y-6 pr-4">
                        {/* Multiplication math boxes */}
                        <div className="grid grid-cols-2 gap-4">
                          {q.multBoxes?.map((box, bIdx) => (
                            <div key={bIdx} className="flex items-center gap-2 p-2 bg-amber-50/20 border border-amber-100 rounded-xl">
                              <span className="text-sm font-bold font-mono">{box.text}</span>
                              {showAnswers && <span className="text-xs font-black text-green-700 bg-green-50 px-1.5 py-0.5 rounded">[{box.correct}]</span>}
                            </div>
                          ))}
                        </div>

                        {/* Division Grid Table & Sidebar Box */}
                        <div className="grid grid-cols-3 gap-6 items-center">
                          {/* Division Grid Table */}
                          <div className="col-span-2 space-y-2">
                            <p className="text-xs text-gray-500 font-black">جدول القسمة الدوري:</p>
                            <div className="border border-gray-300 rounded-xl overflow-hidden shadow-sm">
                              <table className="w-full text-center border-collapse">
                                <thead>
                                  <tr className="bg-gray-100 border-b border-gray-300">
                                    <th className="py-2 px-1 border-r border-gray-300 font-black text-xs text-gray-600">المقسوم</th>
                                    {q.divGrid?.dividends.map((dividend, dIdx) => (
                                      <td key={dIdx} className="py-2 border-r border-gray-300 font-mono font-bold text-sm bg-amber-50/10">{dividend}</td>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  <tr className="border-t border-gray-300">
                                    <th className="py-2 px-1 border-r border-gray-300 font-black text-xs text-gray-600 bg-blue-50/20">{q.divGrid?.divisor}</th>
                                    {q.divGrid?.quotients.map((quotient, qIdx) => (
                                      <td key={qIdx} className="py-2 border-r border-gray-300 font-mono font-bold text-sm text-blue-700">
                                        {showAnswers ? quotient : '.....'}
                                      </td>
                                    ))}
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* Side Choices Box */}
                          <div className="p-3 bg-purple-50/30 border border-purple-100 rounded-xl space-y-2">
                            <p className="text-[10px] text-purple-900 font-black">اختر العدد المناسب وضعه في [ ] :</p>
                            {q.sideMatch?.map((sm, smIdx) => (
                              <div key={smIdx} className="text-xs font-bold text-gray-600 space-y-1">
                                <div className="flex justify-between items-center bg-white p-1 rounded border border-gray-100">
                                  <span>الخيارات: ({sm.val1})</span>
                                  <span className="text-blue-700 font-bold">{sm.equation}</span>
                                </div>
                                {showAnswers && <span className="text-[10px] text-green-700 font-black bg-green-50 px-1 rounded">الجواب: [{sm.correct}]</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 5. MCQ & Fill Blanks Rendering */}
                    {q.type === 'mcq_fill_blank' && (
                      <div className="space-y-6 pr-4">
                        {/* Multiple Choices */}
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500 font-black border-r-2 border-purple-500 pr-2">أولاً: اختر البديل الصحيح من بين البدائل الثلاثة:</p>
                          {q.mcqs?.map((mcq, mIdx) => (
                            <div key={mIdx} className="text-sm font-bold text-gray-700 space-y-1.5">
                              <div className="flex justify-between">
                                <span>({mIdx + 1}) {mcq.text}</span>
                                {showAnswers && <span className="text-green-700 font-black bg-green-50 px-1.5 rounded text-xs">[{mcq.correct}]</span>}
                              </div>
                              <div className="flex gap-6 pr-4 text-xs font-semibold text-gray-500">
                                {mcq.options.map((opt, oIdx) => (
                                  <label key={oIdx} className="flex items-center gap-1.5 cursor-pointer">
                                    <span className="w-4 h-4 rounded-full border border-gray-300 flex items-center justify-center text-[10px] bg-white">
                                      {oIdx === 0 ? 'أ' : oIdx === 1 ? 'ب' : 'ج'}
                                    </span>
                                    <span>{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Fill blanks */}
                        <div className="space-y-3">
                          <p className="text-xs text-gray-500 font-black border-r-2 border-orange-500 pr-2">ثانياً: أكمل العبارات الحسابية بالفراغ المناسب:</p>
                          {q.fills?.map((f, fIdx) => (
                            <div key={fIdx} className="text-sm font-bold text-gray-700 flex justify-between items-center">
                              <span>({fIdx + 1}) {f.text}</span>
                              {showAnswers && <span className="text-green-700 font-black bg-green-50 px-1.5 rounded text-xs">[{f.correct}]</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Answers block at the bottom of the page if enabled */}
              {showAnswers && (
                <div className="mt-4 p-4 bg-green-50/50 border border-green-200 rounded-2xl z-10 text-xs font-sans text-green-800 leading-relaxed">
                  <h4 className="font-black text-green-900 mb-1 flex items-center gap-1">
                    <span>🔑</span> الإجابات النموذجية لورقة العمل {pIdx + 1}:
                  </h4>
                  <div className="space-y-1 pr-2">
                    {page.map((q, idx) => (
                      <p key={q.id}>
                        <strong className="font-bold">س ({idx + 1}):</strong> {q.correctAnswer}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Sheet Footer */}
              <div className="border-t border-gray-200 pt-3 mt-6 text-center text-[10px] text-gray-400 font-bold z-10 flex justify-between">
                <span>توليد تلقائي ذكي عبر منصة نقلة التعليمية 🎒</span>
                <span>الصفحة {pIdx + 1} من {pagesCount}</span>
                <span>علامة مائية موثقة للمناهج الإلكترونية</span>
              </div>
            </div>
            {pIdx < generatedPages.length - 1 && (
              <div className="no-print my-6 flex items-center justify-center gap-4 py-2 select-none">
                <div className="h-0.5 flex-1 border-t-2 border-dashed border-gray-300"></div>
                <span className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-bold border border-gray-200 shadow-sm">
                  ✂️ فاصل صفحات A4 (سيتم فصلها تلقائياً عند الطباعة)
                </span>
                <div className="h-0.5 flex-1 border-t-2 border-dashed border-gray-300"></div>
              </div>
            )}
          </Fragment>
        ))}
        </div>
      </div>
    </div>
  );
}
