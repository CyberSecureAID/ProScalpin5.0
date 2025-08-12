// app.js (versión con Supabase)
// --------------------------------------------------
// Instrucciones: 1) Reemplaza SUPABASE_URL y SUPABASE_ANON_KEY más abajo.
//               2) Asegúrate de crear en Supabase la tabla `site_data` y el bucket `site-images`.
// --------------------------------------------------

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

document.addEventListener('DOMContentLoaded', async () => {
    /*********************
     *  CONFIG SUPABASE  *
     *********************/
    // REEMPLAZA con los valores de tu proyecto Supabase
    const SUPABASE_URL = 'https://zgclauiomeprznsunxfk.supabase.co'; // <--- reemplazar
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnY2xhdWlvbWVwcnpuc3VueGZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ3ODAxMTMsImV4cCI6MjA3MDM1NjExM30.mjDhW1ONWYQ_hWWTkvjYnqshzaxMjJC6B7EZfU6haHM'; // <--- reemplazar

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    /*********************
     *  ELEMENTOS DOM    *
     *********************/
    const elements = {
        profilePicImg: document.getElementById('profile-pic-img'),
        profileName: document.getElementById('profile-name'),
        profileTitle: document.getElementById('profile-title'),
        profileCta: document.getElementById('profile-cta'),
        profileWebsite: document.getElementById('profile-website'),
        socialLinksContainer: document.getElementById('social-links-container'),
        announcementsContainer: document.getElementById('announcements-container'),
        adminButton: document.getElementById('admin-button'),
        adminPanel: document.getElementById('admin-panel'),
        closeAdminPanel: document.getElementById('close-admin-panel'),
        imageUpload: document.getElementById('image-upload'),
        nameInput: document.getElementById('name-input'),
        titleInput: document.getElementById('title-input'),
        ctaInput: document.getElementById('cta-input'),
        websiteTextInput: document.getElementById('website-text-input'),
        websiteUrlInput: document.getElementById('website-url-input'),
        socialLinksManager: document.getElementById('social-links-manager'),
        socialIconSelect: document.getElementById('social-icon-select'),
        socialUrlInput: document.getElementById('social-url-input'),
        addSocialLinkBtn: document.getElementById('add-social-link-btn'),
        cancelEditSocialBtn: document.getElementById('cancel-edit-social-btn'),
        announcementsManager: document.getElementById('announcements-manager'),
        announcementInput: document.getElementById('announcement-input'),
        announcementImageUpload: document.getElementById('announcement-image-upload'),
        announcementLinkInput: document.getElementById('announcement-link-input'),
        addAnnouncementBtn: document.getElementById('add-announcement-btn'),
        saveChangesBtn: document.getElementById('save-changes-btn'),
        // Password modal
        passwordModal: document.getElementById('password-modal'),
        closePasswordModal: document.getElementById('close-password-modal'),
        passwordForm: document.getElementById('password-form'),
        emailInput: document.getElementById('email-input'),
        passwordInput1: document.getElementById('password-1'),
        passwordError: document.getElementById('password-error'),
        // Appearance
        themeColorInput: document.getElementById('theme-color-input'),
        nameSizeSlider: document.getElementById('name-size-slider'),
        titleSizeSlider: document.getElementById('title-size-slider'),
        ctaSizeSlider: document.getElementById('cta-size-slider'),
        nameSizeValue: document.getElementById('name-size-value'),
        titleSizeValue: document.getElementById('title-size-value'),
        ctaSizeValue: document.getElementById('cta-size-value'),
        // Image previews
        profilePicPreview: document.getElementById('profile-pic-preview'),
        revertProfilePicBtn: document.getElementById('revert-profile-pic-btn'),
        announcementImagePreview: document.getElementById('announcement-image-preview'),
    };

    /*********************
     *  DATOS POR DEFECTO*
     *********************/
    const defaultData = {
        profilePic: 'images/default-profile.png',
        name: 'Roiner Menendez',
        title: 'PROSCALPIN 5.0',
        cta: 'Accede a mi sitio web y mira más de mi trabajo',
        websiteText: 'Contacto',
        websiteUrl: '#',
        socialLinks: [
            { icon: 'fab fa-facebook-f', url: '#' },
            { icon: 'fab fa-instagram', url: '#' },
            { icon: 'fab fa-whatsapp', url: '#' },
        ],
        announcements: [],
        themeColor: '#02ffff',
        fontSizes: {
            name: '2.5',
            title: '1',
            cta: '1',
        }
    };

    /*********************
     *  ESTADO APP       *
     *********************/
    let appData = JSON.parse(localStorage.getItem('profileData')) || defaultData;
    // tempData es el objeto donde editas en el panel; después haces "Guardar cambios".
    let tempData = {};
    let editingSocialLinkIndex = null;

    // Constantes
    const MAX_IMAGE_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB (ajustable)

    /*********************
     *  UTIL: Subir archivo a Storage
     *********************/
    async function uploadFileToStorage(file, folder = '') {
        // folder puede ser 'profilepics/' o 'announcements/'
        if (!file) return null;
        // Generar nombre único
        const timestamp = Date.now();
        const safeName = file.name.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '');
        const path = `${folder}${timestamp}_${safeName}`;

        // Subir el File directamente
        const { error: uploadError } = await supabase.storage
            .from('site-images')
            .upload(path, file, { upsert: true });

        if (uploadError) {
            console.error('Error subiendo archivo a Supabase Storage:', uploadError);
            throw uploadError;
        }

        // Obtener URL pública
        const { data } = supabase.storage.from('site-images').getPublicUrl(path);
        return data.publicUrl; // Aquí está la diferencia
    }

    /*********************
     *  UTIL: Convertir File -> DataURL (para previsualizar)
     *********************/
    const readFileAsDataURL = (file, previewElement) => {
        return new Promise((resolve, reject) => {
            if (!file) return resolve(null);
            if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
                alert(`Advertencia: La imagen es grande (${(file.size/1024/1024).toFixed(2)}MB).`);
            }
            const reader = new FileReader();
            reader.onload = () => {
                if (previewElement) {
                    previewElement.src = reader.result;
                    previewElement.style.display = 'block';
                }
                resolve(reader.result);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    /*********************
     *  FUNCIONES SUPABASE: Cargar/Guardar
     *********************/
    // Carga desde Supabase. Si hay datos, los aplica; si no, crea fila con default.
    async function loadFromSupabase() {
        try {
            const { data, error } = await supabase
                .from('site_data')
                .select('data')
                .eq('id', 'main')
                .single();

            if (error && error.code && error.code !== 'PGRST116') {
                // PGRST116 es un ejemplo de error cuando no existe fila; simplemente lo ignoramos
                console.warn('Error al consultar site_data (se usará localStorage si hay):', error);
            }

            if (data && data.data) {
                // Merge: mantén propiedades que falten
                appData = { ...defaultData, ...data.data };
                if (!appData.profilePic) {
                    appData.profilePic = defaultData.profilePic; }
                // Si no vienen fontSizes u otras propiedades, asegura que existan
                if (!appData.fontSizes) appData.fontSizes = defaultData.fontSizes;
                // Guardar en localStorage como cache
                localStorage.setItem('profileData', JSON.stringify(appData));
            } else {
                // No existe la fila: crearla con defaultData
                await supabase.from('site_data').upsert({ id: 'main', data: defaultData });
                appData = defaultData;
                localStorage.setItem('profileData', JSON.stringify(appData));
            }
        } catch (err) {
            console.error('Error en loadFromSupabase:', err);
            // Si hay error (p.e. sin red), usamos lo que haya en localStorage (ya en appData)
        }
    }

    // Guarda appData en Supabase (sube imágenes pendientes primero).
    async function saveToSupabase(dataToSave) {
        // dataToSave debe ser un objeto (no FormData)
        try {
            // 1) Subir imagen de perfil si viene como File en tempData.profilePicFile
            if (dataToSave._profilePicFile) {
                const file = dataToSave._profilePicFile;
                const publicUrl = await uploadFileToStorage(file, 'profilepics/');
                dataToSave.profilePic = publicUrl;
                delete dataToSave._profilePicFile; // limpiar referencia File
            }

            // 2) Revisar anuncios: si tienen campo _imageFile subirlo y reemplazar por imageUrl
            if (Array.isArray(dataToSave.announcements)) {
                for (let i = 0; i < dataToSave.announcements.length; i++) {
                    const ann = dataToSave.announcements[i];
                    if (ann._imageFile) {
                        const publicUrl = await uploadFileToStorage(ann._imageFile, 'announcements/');
                        ann.imageUrl = publicUrl;
                        delete ann._imageFile;
                    }
                }
            }

            // 3) Finalmente, upsert (insertar/actualizar)
            const { error: upsertError } = await supabase
                .from('site_data')
                .upsert({ id: 'main', data: dataToSave });

            if (upsertError) {
                console.error('Error al upsert site_data:', upsertError);
                throw upsertError;
            }

            // 4) Actualizar localStorage y appData en memoria
            appData = JSON.parse(JSON.stringify(dataToSave));
            localStorage.setItem('profileData', JSON.stringify(appData));
            return true;
        } catch (err) {
            console.error('saveToSupabase error:', err);
            throw err;
        }
    }

    /*********************
     *  RENDER (igual que antes, con ligeras adaptaciones)
     *********************/
    const hexToRgb = (hex) => {
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const applyTheme = (color, fontSizes) => {
        const root = document.documentElement;
        root.style.setProperty('--gold-color', color);
        const rgb = hexToRgb(color);
        if (rgb) {
            root.style.setProperty('--gold-color-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`);
        }
        root.style.setProperty('--name-font-size', `${fontSizes.name}rem`);
        root.style.setProperty('--title-font-size', `${fontSizes.title}rem`);
        root.style.setProperty('--cta-font-size', `${fontSizes.cta}rem`);
    };

    const updateSliderValueText = () => {
        elements.nameSizeValue.textContent = `${parseFloat(elements.nameSizeSlider.value).toFixed(1)}rem`;
        elements.titleSizeValue.textContent = `${parseFloat(elements.titleSizeSlider.value).toFixed(2)}rem`;
        elements.ctaSizeValue.textContent = `${parseFloat(elements.ctaSizeSlider.value).toFixed(2)}rem`;
    };

    const renderSocialLinks = () => {
        elements.socialLinksContainer.innerHTML = '';
        appData.socialLinks.forEach(link => {
            const a = document.createElement('a');
            a.href = link.url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.setAttribute('aria-label', link.icon.split(' ')[1].replace('fa-', ''));
            const i = document.createElement('i');
            i.className = link.icon;
            a.appendChild(i);
            elements.socialLinksContainer.appendChild(a);
        });
    };

    const renderAnnouncements = () => {
        elements.announcementsContainer.innerHTML = '';
        (appData.announcements || []).slice().reverse().forEach(announcement => {
            const announcementCardContent = document.createElement('div');
            announcementCardContent.className = 'announcement-card-content';

            if (announcement.imageUrl) {
                const img = document.createElement('img');
                img.src = announcement.imageUrl;
                img.alt = 'Imagen del anuncio';
                img.className = 'announcement-image';
                announcementCardContent.appendChild(img);
            }

            if (announcement.text) {
                const p = document.createElement('p');
                p.textContent = announcement.text;
                announcementCardContent.appendChild(p);
            }

            const announcementCard = document.createElement('div');
            announcementCard.className = 'announcement';
            if (announcement.id) announcementCard.id = `announcement-${announcement.id}`;

            const announcementFooter = document.createElement('div');
            announcementFooter.className = 'announcement-footer';
            announcementFooter.innerHTML = `
                <span class="likes-container" data-id="${announcement.id}">
                    <i class="fas fa-heart like-button"></i>
                    <span class="like-count">${announcement.likes || 0}</span>
                </span>
            `;
            announcementCard.appendChild(announcementCardContent);
            announcementCard.appendChild(announcementFooter);

            if (announcement.linkUrl) {
                const a = document.createElement('a');
                a.href = announcement.linkUrl;
                a.className = 'announcement-link';
                a.target = '_blank';
                a.rel = 'noopener noreferrer';
                a.appendChild(announcementCard);
                elements.announcementsContainer.appendChild(a);
            } else {
                elements.announcementsContainer.appendChild(announcementCard);
            }
        });
    };

    const renderProfile = () => {
        applyTheme(appData.themeColor, appData.fontSizes);
        elements.profilePicImg.src = appData.profilePic || defaultData.profilePic;
        elements.profileName.textContent = appData.name;
        elements.profileTitle.textContent = appData.title;
        elements.profileCta.textContent = appData.cta;
        elements.profileWebsite.textContent = appData.websiteText;
        elements.profileWebsite.href = appData.websiteUrl;
        renderSocialLinks();
        renderAnnouncements();
    };

    const renderAdminPanel = () => {
        elements.nameInput.value = tempData.name;
        elements.titleInput.value = tempData.title;
        elements.ctaInput.value = tempData.cta;
        elements.websiteTextInput.value = tempData.websiteText;
        elements.websiteUrlInput.value = tempData.websiteUrl;

        elements.themeColorInput.value = tempData.themeColor;
        elements.nameSizeSlider.value = tempData.fontSizes.name;
        elements.titleSizeSlider.value = tempData.fontSizes.title;
        elements.ctaSizeSlider.value = tempData.fontSizes.cta;
        updateSliderValueText();

        // Previsualizacion foto de perfil (si ya hay URL o DataURL)
        elements.profilePicPreview.src = tempData.profilePic || '';
        elements.profilePicPreview.style.display = tempData.profilePic ? 'block' : 'none';

        elements.announcementImagePreview.src = '';
        elements.announcementImagePreview.style.display = 'none';

        renderSocialLinksManager();
        renderAnnouncementsManager();
    };

    const renderSocialLinksManager = () => {
        elements.socialLinksManager.innerHTML = '';
        tempData.socialLinks.forEach((link, index) => {
            const item = document.createElement('div');
            item.className = 'managed-item';
            item.innerHTML = `
                <span class="managed-item-info">
                    <i class="${link.icon}"></i>
                    <span class="managed-item-url" title="${link.url}">${link.url}</span>
                </span>
                <div class="managed-item-buttons">
                    <button class="edit-btn" data-index="${index}">Editar</button>
                    <button class="delete-btn" data-index="${index}">Eliminar</button>
                </div>
            `;
            elements.socialLinksManager.appendChild(item);
        });
    };

    const renderAnnouncementsManager = () => {
        elements.announcementsManager.innerHTML = '';
        tempData.announcements.forEach((announcement, index) => {
            const item = document.createElement('div');
            item.className = 'managed-item';
            let content = announcement.text ? `"${announcement.text.substring(0, 30)}..."` : 'Anuncio sin texto';
            if (announcement.imageUrl || announcement._imageFile) content += ' (imagen)';
            if (announcement.linkUrl) content += ' (enlace)';
            item.innerHTML = `
                <span>${content}</span>
                <button class="delete-btn" data-index="${index}">Eliminar</button>
            `;
            elements.announcementsManager.appendChild(item);
        });
    };

    /*********************
     *  INIT: Cargar datos desde Supabase (o localStorage fallback)
     *********************/
    await loadFromSupabase();
    renderProfile();

    /*********************
    *  EVENTOS: UI y Admin
    *********************/
// Abrir modal login (email + password)
elements.adminButton.addEventListener('click', () => {
    elements.passwordError.textContent = '';
    elements.passwordForm.reset();
    elements.passwordModal.classList.add('show');
    elements.emailInput.focus();  // Cambiado para usar el input email
});

const closePasswordModal = () => {
    elements.passwordModal.classList.remove('show');
};
elements.closePasswordModal.addEventListener('click', closePasswordModal);

// Login admin con Supabase Auth (email + password)
elements.passwordForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = elements.emailInput.value.trim();
    const password = elements.passwordInput1.value;

    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
            elements.passwordError.textContent = 'Error: ' + error.message;
        } else {
            closePasswordModal();

            // Copia profunda para edición, como antes
            tempData = JSON.parse(JSON.stringify(appData));
            renderAdminPanel();
            elements.adminPanel.classList.add('show');
        }
    } catch (err) {
        elements.passwordError.textContent = 'Error inesperado, revisa consola.';
        console.error(err);
    }
});

const closeAdminPanel = () => {
    elements.adminPanel.classList.remove('show');
    tempData = {};
    elements.imageUpload.value = '';
    elements.profilePicPreview.style.display = 'none';
    elements.announcementImageUpload.value = '';
    elements.announcementImagePreview.style.display = 'none';
};
elements.closeAdminPanel.addEventListener('click', closeAdminPanel);

// Guardar cambios: sube imágenes si las hay y guarda en Supabase
elements.saveChangesBtn.addEventListener('click', async () => {
    // Actualizar tempData desde inputs
    tempData.name = elements.nameInput.value;
    tempData.title = elements.titleInput.value;
    tempData.cta = elements.ctaInput.value;
    tempData.websiteText = elements.websiteTextInput.value;
    tempData.websiteUrl = elements.websiteUrlInput.value;
    tempData.themeColor = elements.themeColorInput.value;
    tempData.fontSizes = {
        name: elements.nameSizeSlider.value,
        title: elements.titleSizeSlider.value,
        cta: elements.ctaSizeSlider.value,
    };

    try {
        // Llamada que sube imágenes pendientes y hace upsert
        await saveToSupabase(tempData);
        // Al guardarse, recargar la vista pública
        renderProfile();
        closeAdminPanel();
        alert('Cambios guardados correctamente.');
    } catch (err) {
        alert('Error al guardar los cambios. Revisa la consola.');
        console.error(err);
    }
});


    /*********************
     *  IMAGE: subir foto perfil (preview + guardar File en tempData)
     *********************/
    elements.imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // Preview
                await readFileAsDataURL(file, elements.profilePicPreview);
                // Guardar File en tempData para subirlo en "Guardar cambios"
                tempData.profilePic = elements.profilePicPreview.src || tempData.profilePic;
                tempData._profilePicFile = file; // CONVENCIÓN: prefijo _ para indicar File pendiente
            } catch (error) {
                console.error('Error leyendo imagen perfil:', error);
                alert('No se pudo cargar la imagen.');
                elements.profilePicPreview.style.display = 'none';
            }
        } else {
            elements.profilePicPreview.style.display = 'none';
            delete tempData._profilePicFile;
        }
    });

    elements.revertProfilePicBtn.addEventListener('click', () => {
        tempData.profilePic = defaultData.profilePic;
        elements.profilePicPreview.src = defaultData.profilePic;
        elements.profilePicPreview.style.display = 'block';
        elements.imageUpload.value = '';
        delete tempData._profilePicFile;
    });

    // Appearance live preview (cuando mueves sliders / color)
    elements.themeColorInput.addEventListener('input', (e) => {
        tempData.themeColor = e.target.value;
        applyTheme(tempData.themeColor, tempData.fontSizes);
    });
    [elements.nameSizeSlider, elements.titleSizeSlider, elements.ctaSizeSlider].forEach(slider => {
        slider.addEventListener('input', () => {
            tempData.fontSizes.name = elements.nameSizeSlider.value;
            tempData.fontSizes.title = elements.titleSizeSlider.value;
            tempData.fontSizes.cta = elements.ctaSizeSlider.value;
            applyTheme(tempData.themeColor, tempData.fontSizes);
            updateSliderValueText();
        });
    });

    /*********************
     *  SOCIAL LINKS (admin)
     *********************/
    elements.addSocialLinkBtn.addEventListener('click', () => {
        const icon = elements.socialIconSelect.value;
        const url = elements.socialUrlInput.value.trim();
        if (!url) {
            alert('Por favor, introduce una URL para la red social.');
            return;
        }

        if (editingSocialLinkIndex !== null) {
            tempData.socialLinks[editingSocialLinkIndex] = { icon, url };
        } else {
            tempData.socialLinks.push({ icon, url });
        }

        renderSocialLinksManager();
        resetSocialLinkForm();
    });

    elements.cancelEditSocialBtn.addEventListener('click', () => {
        resetSocialLinkForm();
    });

    elements.socialLinksManager.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            tempData.socialLinks.splice(index, 1);
            if (editingSocialLinkIndex == index) resetSocialLinkForm();
            else if (editingSocialLinkIndex > index) editingSocialLinkIndex--;
            renderSocialLinksManager();
        } else if (e.target.classList.contains('edit-btn')) {
            const index = parseInt(e.target.dataset.index, 10);
            const linkToEdit = tempData.socialLinks[index];
            elements.socialIconSelect.value = linkToEdit.icon;
            elements.socialUrlInput.value = linkToEdit.url;
            elements.addSocialLinkBtn.textContent = 'Actualizar';
            elements.cancelEditSocialBtn.style.display = 'inline-block';
            editingSocialLinkIndex = index;
            elements.socialUrlInput.focus();
        }
    });

    const resetSocialLinkForm = () => {
        editingSocialLinkIndex = null;
        elements.socialUrlInput.value = '';
        elements.addSocialLinkBtn.textContent = 'Añadir';
        elements.cancelEditSocialBtn.style.display = 'none';
        elements.socialIconSelect.selectedIndex = 0;
    };

    /*********************
     *  ANNOUNCEMENTS (admin)
     *
     * Nota: aquí sólo guardamos los Files en tempData (prop _imageFile).
     * Sólo se suben cuando se aprieta "Guardar cambios".
     *********************/
    elements.announcementImageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                // preview
                await readFileAsDataURL(file, elements.announcementImagePreview);
                // leave preview shown; actual file will be attached when user pulsa "Añadir anuncio"
            } catch (error) {
                console.error('Error leyendo imagen anuncio:', error);
                alert('No se pudo cargar la imagen del anuncio.');
                elements.announcementImagePreview.style.display = 'none';
            }
        } else {
            elements.announcementImagePreview.style.display = 'none';
        }
    });

    elements.addAnnouncementBtn.addEventListener('click', async () => {
        const text = elements.announcementInput.value.trim();
        const linkUrl = elements.announcementLinkInput.value.trim();
        const imageFile = elements.announcementImageUpload.files[0];

        if (!text && !linkUrl && !imageFile) {
            alert('Por favor, añade algún contenido al anuncio.');
            return;
        }

        // Crear objeto de anuncio en tempData; si hay imageFile la guardamos en la propiedad _imageFile
        const announcementObj = {
            id: Date.now(), // id simple (puedes cambiar a uuid si quieres)
            text,
            imageUrl: null,    // se llenará después si se sube
            linkUrl,
            likes: Math.floor(Math.random()*100) + 1
        };

        if (imageFile) {
            // Guarda la referencia al File para subirla cuando el usuario "Guarde cambios"
            announcementObj._imageFile = imageFile;
        }

        tempData.announcements.push(announcementObj);
        renderAnnouncementsManager();

        // limpiar inputs y preview
        elements.announcementInput.value = '';
        elements.announcementLinkInput.value = '';
        elements.announcementImageUpload.value = '';
        elements.announcementImagePreview.style.display = 'none';
    });

    elements.announcementsManager.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            tempData.announcements.splice(index, 1);
            renderAnnouncementsManager();
        }
    });

    /*********************
     *  Likes (visitas públicas)
     *
     * Incrementamos el like en la fila site_data y actualizamos UI local.
     *********************/
    const handleLikeClick = async (e) => {
        const likeButton = e.target.closest('.like-button');
        if (!likeButton) return;
        const likesContainer = likeButton.closest('.likes-container');
        const announcementId = parseInt(likesContainer.dataset.id, 10);
        if (!announcementId) return;

        // Actualizar UI inmediatamente (optimista)
        const likeCountSpan = likesContainer.querySelector('.like-count');
        if (likeCountSpan) {
            likeCountSpan.textContent = (parseInt(likeCountSpan.textContent || '0', 10) + 1).toString();
        }

        try {
            // Leer la fila actual, incrementar y upsert
            const { data, error } = await supabase
                .from('site_data')
                .select('data')
                .eq('id', 'main')
                .single();

            if (error) {
                console.error('Error leyendo site_data para likes:', error);
                return;
            }

            const current = data.data || {};
            current.announcements = current.announcements || [];
            const idx = current.announcements.findIndex(a => a.id === announcementId);
            if (idx !== -1) {
                current.announcements[idx].likes = (current.announcements[idx].likes || 0) + 1;
                // Guardar de vuelta
                const { error: upsertErr } = await supabase
                    .from('site_data')
                    .upsert({ id: 'main', data: current });

                if (upsertErr) console.error('Error incrementando like:', upsertErr);
                else {
                    // actualizar appData local y localStorage
                    appData = current;
                    localStorage.setItem('profileData', JSON.stringify(appData));
                }
            }
        } catch (err) {
            console.error('handleLikeClick error:', err);
        }
    };

    elements.announcementsContainer.addEventListener('click', handleLikeClick);

    /*********************
     *  Inicial: scroll por hash (igual que antes)
     *********************/
    if (window.location.hash) {
        const elementId = window.location.hash.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
            setTimeout(() => {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500);
        }
    }
});

// Billetes cayendo
const numberOfBills = 20; // cuantos billetes crear
  const billImage = 'images/billete.png'; // imagen billete ejemplo

  for (let i = 0; i < numberOfBills; i++) {
    const bill = document.createElement('img');
    bill.src = billImage;
    bill.className = 'bill';
    bill.style.left = Math.random() * window.innerWidth + 'px';
    bill.style.animationDuration = 3 + Math.random() * 5 + 's';
    bill.style.animationDelay = (Math.random() * 5) + 's';
    bill.style.transform = `rotate(${Math.random() * 360}deg)`;
    document.body.appendChild(bill);

    // Eliminar el billete tras acabar la animación
    bill.addEventListener('animationend', () => bill.remove());
  }