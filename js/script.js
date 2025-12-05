document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contactForm');
    const manufacturerSelect = document.getElementById('vehicle-manufacturer');
    const modelSelect = document.getElementById('vehicle-model');

    const FIPE_API_BASE_URL = 'https://parallelum.com.br/fipe/api/v1/carros/marcas';

    // --- Funções da API FIPE ---

    // Carrega as montadoras
    async function loadManufacturers() {
        try {
            const response = await fetch(FIPE_API_BASE_URL);
            if (!response.ok) {
                throw new Error('Não foi possível carregar as montadoras.');
            }
            const manufacturers = await response.json();
            manufacturerSelect.innerHTML = '<option selected disabled value="">Selecione a montadora</option>'; // Reset
            manufacturers.forEach(manufacturer => {
                const option = new Option(manufacturer.nome, manufacturer.codigo);
                manufacturerSelect.add(option);
            });
        } catch (error) {
            console.error('Erro na API FIPE (Montadoras):', error);
            manufacturerSelect.innerHTML = '<option selected disabled value="">Erro ao carregar</option>';
        }
    }

    // Carrega os modelos da montadora selecionada
    async function loadModels(manufacturerId) {
        if (!manufacturerId) return;
        modelSelect.innerHTML = '<option selected disabled value="">Carregando modelos...</option>';
        modelSelect.disabled = true;
        try {
            const response = await fetch(`${FIPE_API_BASE_URL}/${manufacturerId}/modelos`);
            if (!response.ok) {
                throw new Error('Não foi possível carregar os modelos.');
            }
            const data = await response.json();
            const models = data.modelos;

            // Filtra para remover modelos a diesel
            const filteredModels = models.filter(model => !model.nome.toLowerCase().includes('diesel'));

            modelSelect.innerHTML = '<option selected disabled value="">Selecione o modelo</option>'; // Reset
            filteredModels.forEach(model => {
                const option = new Option(model.nome, model.codigo);
                modelSelect.add(option);
            });
            modelSelect.disabled = false;
        } catch (error) {
            console.error('Erro na API FIPE (Modelos):', error);
            modelSelect.innerHTML = '<option selected disabled value="">Erro ao carregar</option>';
        }
    }


    // --- Funções de Validação e Formatação ---

    function capitalizeName(name) {
        return name.replace(/\b(\w)/g, s => s.toUpperCase());
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }


    // --- Event Listeners ---

    // Carrega as montadoras quando a página carrega
    loadManufacturers();

    // Adiciona o listener para carregar os modelos quando a montadora muda
    manufacturerSelect.addEventListener('change', (event) => {
        const manufacturerId = event.target.value;
        loadModels(manufacturerId);
    });

    // Listener de submit do formulário
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // --- Coleta de Dados ---
        let name = document.getElementById('name').value.trim();
        const manufacturer = manufacturerSelect.options[manufacturerSelect.selectedIndex].text;
        const model = modelSelect.options[modelSelect.selectedIndex].text;
        const email = document.getElementById('email').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const message = document.getElementById('message').value.trim();
        
        // --- Validações ---
        if (!name || !message || !manufacturerSelect.value || !modelSelect.value) {
            alert('Por favor, preencha nome, mensagem e selecione o veículo completo.');
            return;
        }

        if (!email && !phone) {
            alert('Por favor, preencha seu e-mail ou seu telefone para que possamos entrar em contato.');
            return;
        }

        if (email && !isValidEmail(email)) {
            alert('Por favor, insira um endereço de e-mail válido.');
            return;
        }

        // --- Formatação ---
        name = capitalizeName(name);

        // --- Envio para o WhatsApp ---
        const ownerPhone = '5521985086972';

        let contactMethod = '';
        if (email) contactMethod += `E-mail: ${email}\n`;
        if (phone) contactMethod += `Telefone: ${phone}\n`;

        const vehicleInfo = `Veículo: ${manufacturer} ${model}`;

        const whatsappMessage = `(Mensagem enviada através do site da Edisauto)

Olá, Edisauto! Gostaria de fazer um agendamento/orçamento.

*Nome:* ${name}
*Contato:*
${contactMethod}
*${vehicleInfo}*

*Mensagem:* ${message}
        `;

        const whatsappUrl = `https://wa.me/${ownerPhone}?text=${encodeURIComponent(whatsappMessage)}`;

        window.open(whatsappUrl, '_blank');
        contactForm.reset();
        modelSelect.innerHTML = '<option selected disabled value="">Selecione a montadora</option>';
        modelSelect.disabled = true;
    });
});
