document.addEventListener('DOMContentLoaded', () => {
    
    // UI Elements
    const form = document.getElementById('thyroidForm');
    const resultsCard = document.getElementById('resultsCard');
    
    const tshRes = document.getElementById('tshRes');
    const tshStatus = document.getElementById('tshStatus');
    const t3Res = document.getElementById('t3Res');
    const t3Status = document.getElementById('t3Status');
    const t4Res = document.getElementById('t4Res');
    const t4Status = document.getElementById('t4Status');

    const statusBanner = document.getElementById('statusBanner');
    const statusIcon = document.getElementById('statusIcon');
    const diagnosisTitle = document.getElementById('diagnosisTitle');
    const diagnosisDesc = document.getElementById('diagnosisDesc');

    const dietList = document.getElementById('dietList');
    const exerciseList = document.getElementById('exerciseList');

    // Chatbot Elements
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotPanel = document.getElementById('chatbotPanel');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const chatbotMessages = document.getElementById('chatbotMessages');

    // Reference Ranges
    const RANGES = {
        TSH: { min: 0.4, max: 4.0 },   // mIU/L
        T3: { min: 2.3, max: 4.1 },    // pg/mL
        T4: { min: 0.9, max: 1.7 }     // ng/dL
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get values
        const patientName = document.getElementById('patientName').value || 'N/A';
        const patientAge = document.getElementById('patientAge').value || 'N/A';
        const patientGender = document.getElementById('patientGender').value || 'N/A';
        const tsh = parseFloat(document.getElementById('tsh').value);
        const t3 = parseFloat(document.getElementById('t3').value);
        const t4 = parseFloat(document.getElementById('t4').value);

        if (isNaN(tsh) || isNaN(t3) || isNaN(t4)) {
            alert("Please enter valid numerical values for all tests.");
            return;
        }

        document.getElementById('patientReportInfo').innerHTML = `
            <div><span class="metric-label" style="display:inline; margin-right:0.5rem;">Patient Name:</span> <strong style="color:var(--text-main);">${patientName}</strong></div>
            <div><span class="metric-label" style="display:inline; margin-right:0.5rem;">Age:</span> <strong style="color:var(--text-main);">${patientAge}</strong></div>
            <div><span class="metric-label" style="display:inline; margin-right:0.5rem;">Gender:</span> <strong style="color:var(--text-main);">${patientGender.charAt(0).toUpperCase() + patientGender.slice(1)}</strong></div>
        `;

        analyzeThyroidValues(tsh, t3, t4);
        
        // Scroll to results
        resultsCard.style.display = 'block';
        resultsCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    function getStatus(val, range) {
        if (val < range.min) return 'LOW';
        if (val > range.max) return 'HIGH';
        return 'NORMAL';
    }

    function styleMetric(val, status, elRes, elStatus, type) {
        elRes.textContent = val.toFixed(2);
        elStatus.textContent = status;
        
        // Reset classes
        elStatus.className = 'metric-status';
        elRes.parentElement.style.borderColor = 'var(--border)';

        if (status === 'NORMAL') {
            elStatus.classList.add('status-normal');
        } else if (status === 'HIGH') {
            elStatus.classList.add('status-high');
            elRes.parentElement.style.borderColor = 'var(--danger)';
        } else {
            elStatus.classList.add('status-low');
            elRes.parentElement.style.borderColor = 'var(--warning)';
        }
    }

    function analyzeThyroidValues(tsh, t3, t4) {
        const sTsh = getStatus(tsh, RANGES.TSH);
        const sT3 = getStatus(t3, RANGES.T3);
        const sT4 = getStatus(t4, RANGES.T4);

        styleMetric(tsh, sTsh, tshRes, tshStatus);
        styleMetric(t3, sT3, t3Res, t3Status);
        styleMetric(t4, sT4, t4Res, t4Status);

        let diagnosis = "Normal Thyroid Function";
        let desc = "Your levels are within the healthy range. Keep up the good work!";
        let conditionType = "normal";

        // Logic for common thyroid conditions
        if (sTsh === 'HIGH' && (sT4 === 'LOW' || sT3 === 'LOW')) {
            diagnosis = "Possible Overt Hypothyroidism";
            desc = "High TSH with low T4/T3 usually indicates an underactive thyroid. Please consult an endocrinologist.";
            conditionType = "hypo";
        } else if (sTsh === 'HIGH' && sT4 === 'NORMAL') {
            diagnosis = "Possible Subclinical Hypothyroidism";
            desc = "TSH is elevated but T4 is normal. This may be an early stage of an underactive thyroid.";
            conditionType = "hypo_sub";
        } else if (sTsh === 'LOW' && (sT4 === 'HIGH' || sT3 === 'HIGH')) {
            diagnosis = "Possible Overt Hyperthyroidism";
            desc = "Low TSH with high T4/T3 indicates an overactive thyroid. Please see a healthcare provider.";
            conditionType = "hyper";
        } else if (sTsh === 'LOW' && sT4 === 'NORMAL') {
            diagnosis = "Possible Subclinical Hyperthyroidism";
            desc = "TSH is low with normal T4. Often early stage overactive thyroid.";
            conditionType = "hyper_sub";
        } else if (sTsh !== 'NORMAL' || sT3 !== 'NORMAL' || sT4 !== 'NORMAL') {
            diagnosis = "Atypical Thyroid Pattern";
            desc = "Your results show a non-standard pattern. This may require further medical evaluation.";
            conditionType = "atypical";
        }

        updateUI(diagnosis, desc, conditionType);
    }

    function updateUI(diagnosis, desc, type) {
        diagnosisTitle.textContent = diagnosis;
        diagnosisDesc.textContent = desc;

        statusBanner.className = 'status-banner';
        statusIcon.className = 'fa-solid';

        if(type === 'normal') {
            statusBanner.style.background = 'rgba(16, 185, 129, 0.1)';
            statusBanner.style.borderColor = 'rgba(16, 185, 129, 0.2)';
            statusIcon.classList.add('fa-circle-check');
            statusIcon.style.color = 'var(--success)';
        } else if (type.includes('hypo') || type === 'atypical') {
            statusBanner.style.background = 'rgba(245, 158, 11, 0.1)';
            statusBanner.style.borderColor = 'rgba(245, 158, 11, 0.2)';
            statusIcon.classList.add('fa-triangle-exclamation');
            statusIcon.style.color = 'var(--warning)';
        } else {
            // hyper
            statusBanner.style.background = 'rgba(239, 68, 68, 0.1)';
            statusBanner.style.borderColor = 'rgba(239, 68, 68, 0.2)';
            statusIcon.classList.add('fa-circle-exclamation');
            statusIcon.style.color = 'var(--danger)';
        }

        populateRecommendations(type);
    }

    function populateRecommendations(type) {
        dietList.innerHTML = '';
        exerciseList.innerHTML = '';

        let diets = [];
        let exercises = [];

        if (type === 'normal') {
            diets = [
                "Maintain a balanced diet rich in essential nutrients.",
                "Ensure adequate dietary iodine (seafood, dairy, iodized salt).",
                "Include sources of selenium like Brazil nuts or fish.",
                "Stay hydrated and avoid excessive ultra-processed foods."
            ];
            exercises = [
                "At least 150 minutes of moderate-intensity cardio per week.",
                "Incorporate strength training 2-3 times a week.",
                "Practice yoga or stretching for flexibility.",
                "Keep active to maintain general well-being."
            ];
        } else if (type.includes('hypo')) {
            diets = [
                "Increase intake of iodine-rich foods (seaweed, fish, dairy).",
                "Consume foods rich in Zinc and Selenium (nuts, legumes, whole grains).",
                "Avoid excessive raw goitrogens (broccoli, cabbage, spinach) as they may block iodine.",
                "Limit high soy consumption."
            ];
            exercises = [
                "Low-impact aerobics (walking, swimming, cycling).",
                "Strength training to build muscle and boost metabolism.",
                "Yoga and stretching to combat stiffness and fatigue.",
                "Avoid extreme-intensity workouts if feeling highly fatigued."
            ];
        } else if (type.includes('hyper')) {
            diets = [
                "Avoid excess iodine (kelp, seaweed, iodized salt supplements).",
                "Increase cruciferous vegetables (broccoli, cauliflower) which can naturally decrease thyroid hormone production.",
                "Ensure high calorie/protein intake if experiencing weight loss.",
                "Limit caffeine and energy drinks, which can exacerbate heart palpitations."
            ];
            exercises = [
                "Focus on low-intensity, calming exercises like Yoga or Tai Chi.",
                "Light walking or swimming.",
                "Weight bearing exercises (if cleared by a doctor) to maintain bone density.",
                "Avoid high-intensityinterval training (HIIT) due to potential elevated heart rate."
            ];
        } else {
            diets = [
                "Eat a nutritionally balanced diet.",
                "Keep a consistent eating schedule.",
                "Consult a nutritionist regarding specific concerns."
            ];
            exercises = [
                "Engage in moderate physical activity.",
                "Listen to your body and rest if feeling fatigued.",
                "Consult your doctor before starting any rigorous regimen."
            ];
        }

        diets.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            dietList.appendChild(li);
        });

        exercises.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            exerciseList.appendChild(li);
        });
    }

    window.resetForm = function() {
        form.reset();
        resultsCard.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- Chatbot Logic ---
    chatbotToggle.addEventListener('click', () => {
        chatbotPanel.style.display = 'flex';
        chatbotToggle.style.transform = 'scale(0)';
        setTimeout(() => chatInput.focus(), 100);
    });

    chatbotClose.addEventListener('click', () => {
        chatbotPanel.style.display = 'none';
        chatbotToggle.style.transform = 'scale(1)';
    });

    sendBtn.addEventListener('click', handleChat);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleChat();
    });

    function handleChat() {
        const text = chatInput.value.trim();
        if(!text) return;

        appendMessage('user', text);
        chatInput.value = '';

        // Mock bot response
        setTimeout(() => {
            const response = generateBotResponse(text.toLowerCase());
            appendMessage('bot', response);
        }, 600);
    }

    function appendMessage(sender, text) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}`;
        msgDiv.textContent = text;
        chatbotMessages.appendChild(msgDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function generateBotResponse(input) {
        if(input.includes('tsh')) {
            return "TSH stands for Thyroid Stimulating Hormone. It's produced by the pituitary gland and tells your thyroid how much T4 and T3 to make.";
        } else if (input.includes('t3') || input.includes('t4')) {
            return "T3 (Triiodothyronine) and T4 (Thyroxine) are the main hormones produced by the thyroid gland. They control your body's metabolism.";
        } else if (input.includes('food') || input.includes('diet')) {
            return "A healthy thyroid diet generally includes enough iodine, selenium, and zinc. However, if you have hypothyroidism or hyperthyroidism, specific tweaks are needed. Run an analysis on the dashboard to get personalized recommendations!";
        } else if (input.includes('exercise')) {
            return "For hypothyroidism, moderate exercises like walking and swimming are great. For hyperthyroidism, calming exercises like Yoga are better. It depends on your levels!";
        } else if (input.includes('hi') || input.includes('hello')) {
            return "Hello! I am your Thyro Assistant. You can ask me about TSH, T3, T4, diet, or exercises.";
        } else {
            return "That's an interesting question. I'm an AI assistant focused on Thyroid health. I recommend analyzing your lab results in the form or consulting an endocrinologist for precise medical advice.";
        }
    }
});
