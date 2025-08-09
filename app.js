document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
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
        passwordInput1: document.getElementById('password-1'),
        passwordInput2: document.getElementById('password-2'),
        passwordError: document.getElementById('password-error'),
        // Appearance
        themeColorInput: document.getElementById('theme-color-input'),
        nameSizeSlider: document.getElementById('name-size-slider'),
        titleSizeSlider: document.getElementById('title-size-slider'),
        ctaSizeSlider: document.getElementById('cta-size-slider'),
        nameSizeValue: document.getElementById('name-size-value'),
        titleSizeValue: document.getElementById('title-size-value'),
        ctaSizeValue: document.getElementById('cta-size-value'),
        // New elements for image handling
        profilePicPreview: document.getElementById('profile-pic-preview'),
        revertProfilePicBtn: document.getElementById('revert-profile-pic-btn'),
        announcementImagePreview: document.getElementById('announcement-image-preview'),
    };

    // --- DATA ---
    const defaultData = {
        profilePic: '/photo_2025-08-09_18-00-32.jpg',
        name: 'Roiner Menendez',
        title: 'FOTÓGRAFO',
        cta: 'Accede a mi sitio web y mira más de mi trabajo',
        websiteText: 'Contacto',
        websiteUrl: '#',
        socialLinks: [
            { icon: 'fab fa-facebook-f', url: '#' },
            { icon: 'fab fa-instagram', url: '#' },
            { icon: 'fab fa-whatsapp', url: '#' },
        ],
        announcements: [],
        themeColor: '#d4af37',
        fontSizes: {
            name: '2.5',
            title: '1',
            cta: '1',
        }
    };

    // Load data from localStorage; this makes changes "permanent" for the user.
    let appData = JSON.parse(localStorage.getItem('profileData')) || defaultData;
    // Ensure new properties exist for users with old data
    if (!appData.themeColor) appData.themeColor = defaultData.themeColor;
    if (!appData.fontSizes) appData.fontSizes = defaultData.fontSizes;
    if (appData.announcements && appData.announcements.length > 0) {
        appData.announcements.forEach((a, i) => {
            if (!a.id) a.id = Date.now() + i;
            // Initialize likes for existing announcements if they don't have it
            if (typeof a.likes === 'undefined') {
                a.likes = Math.floor(Math.random() * 100) + 1; // Random likes between 1 and 100
            }
        });
        saveData(); // Save if new properties were added or IDs initialized
    }
    
    let tempData = {};
    let editingSocialLinkIndex = null;

    // Constants
    const MAX_IMAGE_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

    // --- DATA SAVING ---
    const saveData = () => {
        localStorage.setItem('profileData', JSON.stringify(appData));
    };

    // --- RENDER FUNCTIONS ---
    const renderProfile = () => {
        applyTheme(appData.themeColor, appData.fontSizes);
        elements.profilePicImg.src = appData.profilePic;
        elements.profileName.textContent = appData.name;
        elements.profileTitle.textContent = appData.title;
        elements.profileCta.textContent = appData.cta;
        elements.profileWebsite.textContent = appData.websiteText;
        elements.profileWebsite.href = appData.websiteUrl;
        renderSocialLinks();
        renderAnnouncements();
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
        appData.announcements.slice().reverse().forEach(announcement => {
            // This will hold image/text content
            const announcementCardContent = document.createElement('div');
            announcementCardContent.className = 'announcement-card-content';

            if (announcement.imageUrl) {
                const img = document.createElement('img');
                img.src = announcement.imageUrl;
                img.alt = 'Imagem do anúncio';
                img.className = 'announcement-image';
                announcementCardContent.appendChild(img);
            }

            if(announcement.text) {
                const p = document.createElement('p');
                p.textContent = announcement.text;
                announcementCardContent.appendChild(p);
            }

            // Create the main announcement card div
            const announcementCard = document.createElement('div');
            announcementCard.className = 'announcement';
            if (announcement.id) {
                announcementCard.id = `announcement-${announcement.id}`;
            }

            // Likes Section
            const announcementFooter = document.createElement('div');
            announcementFooter.className = 'announcement-footer';
            announcementFooter.innerHTML = `
                <span class="likes-container" data-id="${announcement.id}">
                    <i class="fas fa-heart like-button"></i>
                    <span class="like-count">${announcement.likes}</span>
                </span>
            `;
            
            // Append content and footer to the main announcement card
            announcementCard.appendChild(announcementCardContent);
            announcementCard.appendChild(announcementFooter);

            // Handle the overall linking of the card
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
    
    const renderAdminPanel = () => {
        elements.nameInput.value = tempData.name;
        elements.titleInput.value = tempData.title;
        elements.ctaInput.value = tempData.cta;
        elements.websiteTextInput.value = tempData.websiteText;
        elements.websiteUrlInput.value = tempData.websiteUrl;

        // Render appearance controls
        elements.themeColorInput.value = tempData.themeColor;
        elements.nameSizeSlider.value = tempData.fontSizes.name;
        elements.titleSizeSlider.value = tempData.fontSizes.title;
        elements.ctaSizeSlider.value = tempData.fontSizes.cta;
        updateSliderValueText();
        
        // Render image previews
        elements.profilePicPreview.src = tempData.profilePic;
        elements.profilePicPreview.style.display = tempData.profilePic ? 'block' : 'none';
        
        elements.announcementImagePreview.src = ''; // Clear announcement preview
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
            if (announcement.imageUrl) content += ' (imagen)';
            if (announcement.linkUrl) content += ' (enlace)';
            
            item.innerHTML = `
                <span>${content}</span>
                <button class="delete-btn" data-index="${index}">Eliminar</button>
            `;
            elements.announcementsManager.appendChild(item);
        });
    };

    // --- THEME & APPEARANCE ---
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

    // --- UTILITY ---
    const getYesterdayDateString = () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const day = String(yesterday.getDate()).padStart(2, '0');
        const month = String(yesterday.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = yesterday.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const readFileAsDataURL = (file, previewElement) => {
        return new Promise((resolve, reject) => {
            if (file.size > MAX_IMAGE_FILE_SIZE_BYTES) {
                alert(`Advertencia: La imagen es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)} MB). Las imágenes grandes pueden no guardarse permanentemente debido a las limitaciones del almacenamiento del navegador.`);
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

    // --- EVENT LISTENERS ---
    
    // Open/Close Admin Panel and Password Modal
    elements.adminButton.addEventListener('click', () => {
        elements.passwordError.textContent = '';
        elements.passwordForm.reset();
        elements.passwordModal.classList.add('show');
        elements.passwordInput1.focus();
    });

    const closePasswordModal = () => {
        elements.passwordModal.classList.remove('show');
    };

    elements.closePasswordModal.addEventListener('click', closePasswordModal);

    elements.passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const pass1 = elements.passwordInput1.value;
        const pass2 = elements.passwordInput2.value;

        const correctPass1 = "CopiarteI83dgwyñ";
        const correctPass2 = "NoCopiartOkjavcñ";

        if (pass1 === correctPass1 && pass2 === correctPass2) {
            closePasswordModal();
            // Open admin panel
            tempData = JSON.parse(JSON.stringify(appData)); // Deep copy for editing
            renderAdminPanel();
            elements.adminPanel.classList.add('show');
        } else {
            elements.passwordError.textContent = 'Una o ambas contraseñas son incorrectas.';
            elements.passwordForm.reset();
            elements.passwordInput1.focus();
        }
    });

    const closeAdminPanel = () => {
        elements.adminPanel.classList.remove('show');
        tempData = {}; // Clear temporary data
        // Clear file inputs and previews when closing panel
        elements.imageUpload.value = '';
        elements.profilePicPreview.style.display = 'none';
        elements.announcementImageUpload.value = '';
        elements.announcementImagePreview.style.display = 'none';
    };

    elements.closeAdminPanel.addEventListener('click', closeAdminPanel);

    // Save Changes Button
    elements.saveChangesBtn.addEventListener('click', () => {
        // Update live data from inputs before saving
        tempData.name = elements.nameInput.value;
        tempData.title = elements.titleInput.value;
        tempData.cta = elements.ctaInput.value;
        tempData.websiteText = elements.websiteTextInput.value;
        tempData.websiteUrl = elements.websiteUrlInput.value;
        
        appData = JSON.parse(JSON.stringify(tempData)); // Commit changes
        saveData();
        renderProfile();
        closeAdminPanel();
    });

    // Profile Picture Upload
    elements.imageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                const imageUrl = await readFileAsDataURL(file, elements.profilePicPreview);
                tempData.profilePic = imageUrl;
            } catch (error) {
                console.error("Error reading profile picture file:", error);
                alert("No se pudo cargar la imagen.");
                elements.profilePicPreview.style.display = 'none';
            }
        } else {
            elements.profilePicPreview.style.display = 'none';
        }
    });

    elements.revertProfilePicBtn.addEventListener('click', () => {
        tempData.profilePic = defaultData.profilePic;
        elements.profilePicPreview.src = defaultData.profilePic;
        elements.profilePicPreview.style.display = 'block';
        elements.imageUpload.value = ''; // Clear the file input
    });
    
    // Appearance Controls Listeners
    elements.themeColorInput.addEventListener('input', (e) => {
        tempData.themeColor = e.target.value;
        applyTheme(tempData.themeColor, tempData.fontSizes); // Live preview
    });

    [elements.nameSizeSlider, elements.titleSizeSlider, elements.ctaSizeSlider].forEach(slider => {
        slider.addEventListener('input', () => {
            tempData.fontSizes.name = elements.nameSizeSlider.value;
            tempData.fontSizes.title = elements.titleSizeSlider.value;
            tempData.fontSizes.cta = elements.ctaSizeSlider.value;
            applyTheme(tempData.themeColor, tempData.fontSizes); // Live preview
            updateSliderValueText();
        });
    });
    
    // Text Inputs: Changes are applied to tempData directly, and committed on save.
    // The previous commented-out listener block for direct saving on input is removed for clarity.
    // No direct listeners here as changes are handled by the main save function.

    // Social Links
    elements.addSocialLinkBtn.addEventListener('click', () => {
        const icon = elements.socialIconSelect.value;
        const url = elements.socialUrlInput.value.trim();
        if (!url) {
            alert('Por favor, introduce una URL para la red social.');
            return;
        }

        if (editingSocialLinkIndex !== null) {
            // Update existing link
            tempData.socialLinks[editingSocialLinkIndex] = { icon, url };
        } else {
            // Add new link
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
            if (editingSocialLinkIndex == index) {
                resetSocialLinkForm();
            } else if (editingSocialLinkIndex > index) {
                editingSocialLinkIndex--;
            }
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

    // Announcements
    elements.announcementImageUpload.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                await readFileAsDataURL(file, elements.announcementImagePreview);
            } catch (error) {
                console.error("Error reading announcement image file:", error);
                alert("No se pudo cargar la imagen del anuncio.");
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

        let imageUrl = null;
        if (imageFile) {
            try {
                imageUrl = await readFileAsDataURL(imageFile); // No preview element here, as it's for adding. Preview already shown by change listener.
            } catch (error) {
                console.error("Erro ao ler o arquivo de imagem:", error);
                alert("No se pudo cargar la imagen.");
                return;
            }
        }
        
        tempData.announcements.push({ 
            id: Date.now(),
            text, 
            imageUrl, 
            linkUrl,
            likes: Math.floor(Math.random() * 100) + 1 // Random likes between 1 and 100
        });
        renderAnnouncementsManager();
        
        elements.announcementInput.value = '';
        elements.announcementLinkInput.value = '';
        elements.announcementImageUpload.value = ''; // Clear file input
        elements.announcementImagePreview.style.display = 'none'; // Hide preview
    });
    
    elements.announcementsManager.addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const index = e.target.dataset.index;
            tempData.announcements.splice(index, 1);
            renderAnnouncementsManager();
        }
    });

    // Handle liking announcements
    const handleLikeClick = (e) => {
        const likeButton = e.target.closest('.like-button');
        if (likeButton) {
            const likesContainer = likeButton.closest('.likes-container');
            // The announcement ID might be on the main announcementCard or its wrapper <a>
            // Let's get it from the likesContainer's data-id
            const announcementId = parseInt(likesContainer.dataset.id); 
            const announcementIndex = appData.announcements.findIndex(ann => ann.id === announcementId);

            if (announcementIndex !== -1) {
                appData.announcements[announcementIndex].likes++;
                saveData();
                // Update the displayed count immediately without full re-render
                const likeCountSpan = likesContainer.querySelector('.like-count');
                if (likeCountSpan) {
                    likeCountSpan.textContent = appData.announcements[announcementIndex].likes;
                }
            }
        }
    };
    elements.announcementsContainer.addEventListener('click', handleLikeClick);


    // --- INITIALIZATION ---
    renderProfile();

    // Scroll to announcement if hash is present
    if (window.location.hash) {
        const elementId = window.location.hash.substring(1);
        const element = document.getElementById(elementId);
        if (element) {
            setTimeout(() => {
                 element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 500); // Delay to ensure all content is rendered
        }
    }
});