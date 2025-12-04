// État de l'application
let state = {
    selectedColor: 'red',
    selectedSize: 'small',
    board: Array(6).fill(null).map(() => Array(4).fill(null)),
    history: [],
    selectedPion: null,
    pendingCell: null // Cellule en attente de placement
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initializeBoard();
    setupEventListeners();
    loadState();
    renderBoard();
});

// Initialiser le tableau
function initializeBoard() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', (e) => handleCellClick(row, col, e));
            board.appendChild(cell);
        }
    }
}

// Configurer les écouteurs d'événements
function setupEventListeners() {

    // Boutons d'action du menu contextuel
    document.getElementById('deleteBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        handleDelete();
    });
    document.getElementById('cancelBtn').addEventListener('click', (e) => {
        e.stopPropagation();
        cancelAction();
    });

    // Fermer les menus si on clique ailleurs
    document.addEventListener('click', (e) => {
        const contextMenu = document.getElementById('contextMenu');
        const selectionPanel = document.getElementById('selectionPanel');
        const cell = e.target.closest('.cell');
        const pionOption = e.target.closest('.pion-option');
        const cancelBtn = e.target.closest('#cancelSelectionBtn');
        
        // Ne pas fermer si on clique sur les menus ou sur une cellule avec un pion
        if (contextMenu && contextMenu.style.display !== 'none') {
            if (!contextMenu.contains(e.target) && !cell) {
                hideContextMenu();
            }
        }
        
        // Fermer le panneau de sélection si on clique ailleurs (mais pas sur une cellule vide ni sur une option de pion)
        if (selectionPanel && selectionPanel.style.display !== 'none' && selectionPanel.style.visibility !== 'hidden') {
            if (!selectionPanel.contains(e.target) && !cell && !pionOption && !cancelBtn) {
                hideSelectionPanel();
            }
        }
    });

    // Boutons de contrôle
    document.getElementById('resetBtn').addEventListener('click', handleReset);
    document.getElementById('undoBtn').addEventListener('click', handleUndo);
    
    // Bouton d'annulation du panneau de sélection
    document.getElementById('cancelSelectionBtn').addEventListener('click', cancelSelection);
}

// Gérer le clic sur une cellule
function handleCellClick(row, col, event) {
    // Si un pion existe déjà dans cette cellule
    if (state.board[row][col] !== null) {
        // Fermer le panneau de sélection s'il est ouvert
        if (state.pendingCell) {
            hideSelectionPanel();
        }
        
        // Si c'est le même pion, fermer le menu, sinon l'ouvrir
        if (state.selectedPion && state.selectedPion.row === row && state.selectedPion.col === col) {
            hideContextMenu();
            return;
        }
        
        // Empêcher la propagation pour éviter de fermer le menu immédiatement
        if (event) {
            event.stopPropagation();
        }
        // Sélectionner le pion pour afficher les options
        state.selectedPion = { row, col };
        showContextMenu(row, col, event);
        highlightCell(row, col);
        return;
    }

    // Si on clique sur une cellule vide, afficher le panneau de sélection
    if (event) {
        event.stopPropagation();
    }
    
    if (state.selectedPion) {
        hideContextMenu();
    }
    
    // Fermer le panneau de sélection précédent s'il existe
    if (state.pendingCell) {
        hideSelectionPanel();
    }

    // Afficher le panneau de sélection pour cette cellule
    state.pendingCell = { row, col };
    showSelectionPanel(row, col, event);
}

// Afficher le menu contextuel près du pion
function showContextMenu(row, col, event) {
    const contextMenu = document.getElementById('contextMenu');
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    const mobileOverlay = document.getElementById('mobileOverlay');
    
    if (!cell) return;
    
    const isMobile = window.innerWidth <= 768;
    const isSmallMobile = window.innerWidth <= 480;
    
    // Afficher l'overlay sur mobile
    if (isMobile && mobileOverlay) {
        mobileOverlay.style.display = 'block';
        mobileOverlay.addEventListener('click', hideContextMenu);
    } else if (mobileOverlay) {
        mobileOverlay.style.display = 'none';
    }
    
    // Mesurer le menu pour un positionnement précis
    contextMenu.style.display = 'flex';
    const menuRect = contextMenu.getBoundingClientRect();
    const menuWidth = menuRect.width;
    const menuHeight = menuRect.height;
    
    if (isMobile) {
        // Sur mobile, centrer le menu à l'écran
        const margin = isSmallMobile ? 8 : 10;
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        
        // Limiter la largeur maximale
        const maxMenuWidth = Math.min(300, viewportWidth - margin * 2);
        
        // Calculer la position verticale pour centrer
        let calculatedTop = (viewportHeight - menuHeight) / 2;
        
        // S'assurer que le menu ne dépasse pas en haut ou en bas
        if (calculatedTop < margin) {
            calculatedTop = margin;
        } else if (calculatedTop + menuHeight > viewportHeight - margin) {
            calculatedTop = Math.max(margin, viewportHeight - menuHeight - margin);
        }
        
        // Positionner par rapport à la fenêtre (position fixed)
        const left = (viewportWidth - maxMenuWidth) / 2;
        contextMenu.style.position = 'fixed';
        contextMenu.style.left = `${left}px`;
        contextMenu.style.top = `${calculatedTop}px`;
        contextMenu.style.width = `${maxMenuWidth}px`;
        contextMenu.style.maxWidth = `${maxMenuWidth}px`;
        contextMenu.classList.remove('arrow-left', 'arrow-right');
    } else {
        // Sur desktop, positionner près de la cellule
        const cellRect = cell.getBoundingClientRect();
        const containerRect = document.querySelector('.container').getBoundingClientRect();
        
        // Positionner le menu à droite du pion par défaut
        let left = cellRect.right + 15;
        let top = cellRect.top + (cellRect.height / 2) - (menuHeight / 2);
        let arrowPosition = 'left';
        
        // Vérifier si le menu sort de l'écran à droite
        if (left + menuWidth > containerRect.right - 10) {
            // Positionner à gauche du pion
            left = cellRect.left - menuWidth - 15;
            arrowPosition = 'right';
        }
        
        // Vérifier si le menu sort en bas
        if (top + menuHeight > containerRect.bottom - 10) {
            top = containerRect.bottom - menuHeight - 10;
        }
        
        // Vérifier si le menu sort en haut
        if (top < containerRect.top + 10) {
            top = containerRect.top + 10;
        }
        
        // Ajuster la position de la flèche selon la position du menu
        contextMenu.classList.remove('arrow-left', 'arrow-right');
        contextMenu.classList.add(`arrow-${arrowPosition}`);
        
        // Positionner le menu (coordonnées relatives au container)
        contextMenu.style.position = 'absolute';
        contextMenu.style.left = `${left - containerRect.left}px`;
        contextMenu.style.top = `${top - containerRect.top}px`;
        contextMenu.style.width = '';
        contextMenu.style.maxWidth = '';
    }
}

// Masquer le menu contextuel
function hideContextMenu() {
    const contextMenu = document.getElementById('contextMenu');
    const mobileOverlay = document.getElementById('mobileOverlay');
    contextMenu.style.display = 'none';
    // Réinitialiser le positionnement
    contextMenu.style.position = '';
    contextMenu.style.left = '';
    contextMenu.style.top = '';
    contextMenu.style.width = '';
    contextMenu.style.maxWidth = '';
    if (mobileOverlay) {
        mobileOverlay.style.display = 'none';
        mobileOverlay.removeEventListener('click', hideContextMenu);
    }
    clearHighlights();
}

// Afficher le panneau de sélection avec les images de pions
function showSelectionPanel(row, col, event) {
    const selectionPanel = document.getElementById('selectionPanel');
    const pionGrid = document.getElementById('pionSelectionGrid');
    const mobileOverlay = document.getElementById('mobileOverlay');
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    
    if (!cell || !selectionPanel || !pionGrid) {
        return;
    }
    
    // Générer la grille d'images de pions
    pionGrid.innerHTML = '';
    
    const sizes = ['small', 'medium', 'large'];
    const colors = ['red', 'yellow', 'green', 'blue'];
    const colorMap = {
        'red': 'rouge',
        'yellow': 'jaune',
        'green': 'vert',
        'blue': 'bleu'
    };
    const sizeMap = {
        'small': 'petit',
        'medium': 'moyen',
        'large': 'grand'
    };
    
    sizes.forEach(size => {
        colors.forEach(color => {
            const pionOption = document.createElement('div');
            pionOption.className = 'pion-option';
            pionOption.dataset.size = size;
            pionOption.dataset.color = color;
            
            const pionImg = document.createElement('img');
            pionImg.src = `${sizeMap[size]}/${colorMap[color]}.png`;
            pionImg.alt = `Pion ${color} ${size}`;
            pionImg.className = `pion-preview ${size}`;
            pionImg.draggable = false;
            
            pionOption.appendChild(pionImg);
            
            pionOption.addEventListener('click', (e) => {
                e.stopPropagation();
                selectPion(row, col, color, size);
            });
            
            pionGrid.appendChild(pionOption);
        });
    });
    
    // Afficher l'overlay sur mobile
    const updateOverlay = () => {
        const isMobile = window.innerWidth <= 768;
        if (isMobile && mobileOverlay) {
            mobileOverlay.style.display = 'block';
            mobileOverlay.addEventListener('click', hideSelectionPanel);
        } else if (mobileOverlay) {
            mobileOverlay.style.display = 'none';
        }
    };
    
    updateOverlay();
    
    // Afficher d'abord pour mesurer
    selectionPanel.style.display = 'flex';
    selectionPanel.style.visibility = 'hidden';
    selectionPanel.style.opacity = '0';
    
    // Fonction pour positionner le panneau
    const updatePanelPosition = () => {
        const cellRect = cell.getBoundingClientRect();
        const containerRect = document.querySelector('.container').getBoundingClientRect();
        const isMobile = window.innerWidth <= 768;
        const isSmallMobile = window.innerWidth <= 480;
        
        const panelRect = selectionPanel.getBoundingClientRect();
        const panelWidth = panelRect.width;
        const panelHeight = panelRect.height;
        
        let left, top, arrowPosition = 'top';
        
        if (isMobile) {
            // Sur mobile, centrer le panneau à l'écran (position absolue par rapport à la fenêtre)
            const margin = isSmallMobile ? 8 : 10;
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            
            // Calculer la position verticale pour centrer, mais s'assurer qu'il reste dans la vue
            let calculatedTop = (viewportHeight - panelHeight) / 2;
            
            // S'assurer que le panneau ne dépasse pas en haut ou en bas
            if (calculatedTop < margin) {
                calculatedTop = margin;
            } else if (calculatedTop + panelHeight > viewportHeight - margin) {
                calculatedTop = Math.max(margin, viewportHeight - panelHeight - margin);
            }
            
            // Positionner par rapport à la fenêtre, pas au container
            left = margin;
            top = calculatedTop;
            arrowPosition = 'none';
            
            // Ajuster la largeur et hauteur pour mobile
            // Limiter la largeur maximale pour éviter que le panneau soit trop large
            const maxPanelWidth = Math.min(400, viewportWidth - margin * 2);
            selectionPanel.style.width = `${maxPanelWidth}px`;
            selectionPanel.style.maxWidth = `${maxPanelWidth}px`;
            selectionPanel.style.maxHeight = `calc(100vh - ${margin * 2}px)`;
            
            // Recalculer la position horizontale pour centrer
            left = (viewportWidth - maxPanelWidth) / 2;
            
            // Positionner par rapport à la fenêtre (position fixed)
            selectionPanel.style.position = 'fixed';
            selectionPanel.style.left = `${left}px`;
            selectionPanel.style.top = `${top}px`;
            selectionPanel.style.right = 'auto';
            selectionPanel.style.visibility = 'visible';
            selectionPanel.style.opacity = '1';
            selectionPanel.classList.remove('arrow-top', 'arrow-bottom', 'arrow-none');
            return; // Sortir de la fonction pour éviter le positionnement desktop
        } else {
            // Sur desktop, positionner près de la cellule
            // Convertir les coordonnées de la fenêtre en coordonnées relatives au container
            const cellLeftRelative = cellRect.left - containerRect.left;
            const cellTopRelative = cellRect.top - containerRect.top;
            const cellBottomRelative = cellTopRelative + cellRect.height;
            
            left = cellLeftRelative + (cellRect.width / 2) - (panelWidth / 2);
            top = cellBottomRelative + 15;
            
            // Vérifier si le panneau sort de l'écran à droite
            if (left + panelWidth > containerRect.width - 10) {
                left = containerRect.width - panelWidth - 10;
            }
            
            // Vérifier si le panneau sort à gauche
            if (left < 10) {
                left = 10;
            }
            
            // Vérifier si le panneau sort en bas, le placer au-dessus si nécessaire
            if (top + panelHeight > containerRect.height - 10) {
                top = cellTopRelative - panelHeight - 15;
                arrowPosition = 'bottom';
            }
            
            // Vérifier si le panneau sort en haut
            if (top < 10) {
                top = 10;
                arrowPosition = 'top';
            }
            
            // Réinitialiser la largeur pour desktop
            selectionPanel.style.width = '';
            selectionPanel.style.maxWidth = '';
            selectionPanel.style.maxHeight = '';
            selectionPanel.style.position = 'absolute'; // Position absolue par rapport au container
            
            // Positionner le panneau (coordonnées relatives au container pour desktop)
            selectionPanel.style.left = `${left}px`;
            selectionPanel.style.top = `${top}px`;
            selectionPanel.style.visibility = 'visible';
            selectionPanel.style.opacity = '1';
            selectionPanel.classList.remove('arrow-top', 'arrow-bottom', 'arrow-none');
            if (arrowPosition !== 'none') {
                selectionPanel.classList.add(`arrow-${arrowPosition}`);
            }
        }
    };
    
    // Attendre le prochain frame pour mesurer
    requestAnimationFrame(() => {
        updatePanelPosition();
        
        // Ajouter un listener pour le redimensionnement
        const resizeHandler = () => {
            if (selectionPanel.style.display !== 'none') {
                updateOverlay();
                updatePanelPosition();
            }
        };
        
        // Stocker le handler pour pouvoir le retirer plus tard
        selectionPanel._resizeHandler = resizeHandler;
        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', resizeHandler);
    });
}

// Sélectionner un pion et le placer
function selectPion(row, col, color, size) {
    saveState();
    state.board[row][col] = {
        color: color,
        size: size
    };
    hideSelectionPanel();
    renderBoard();
    saveState();
}

// Masquer le panneau de sélection
function hideSelectionPanel() {
    const selectionPanel = document.getElementById('selectionPanel');
    const mobileOverlay = document.getElementById('mobileOverlay');
    selectionPanel.style.display = 'none';
    // Réinitialiser le positionnement
    selectionPanel.style.position = '';
    selectionPanel.style.left = '';
    selectionPanel.style.top = '';
    selectionPanel.style.right = '';
    selectionPanel.style.width = '';
    selectionPanel.style.maxWidth = '';
    selectionPanel.style.maxHeight = '';
    if (mobileOverlay) {
        mobileOverlay.style.display = 'none';
        mobileOverlay.removeEventListener('click', hideSelectionPanel);
    }
    
    // Retirer le listener de redimensionnement
    if (selectionPanel._resizeHandler) {
        window.removeEventListener('resize', selectionPanel._resizeHandler);
        window.removeEventListener('orientationchange', selectionPanel._resizeHandler);
        selectionPanel._resizeHandler = null;
    }
    
    state.pendingCell = null;
}


// Annuler la sélection
function cancelSelection() {
    hideSelectionPanel();
}

// Surligner une cellule
function highlightCell(row, col) {
    clearHighlights();
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.classList.add('selected');
    }
}

// Effacer les surlignages
function clearHighlights() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('selected');
    });
}

// Gérer la suppression
function handleDelete() {
    if (state.selectedPion) {
        saveState();
        const { row, col } = state.selectedPion;
        state.board[row][col] = null;
        state.selectedPion = null;
        hideContextMenu();
        renderBoard();
        saveState();
    }
}

// Annuler l'action
function cancelAction() {
    state.selectedPion = null;
    hideContextMenu();
}

// Gérer le reset
function handleReset() {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le tableau ?')) {
        saveState();
        state.board = Array(6).fill(null).map(() => Array(4).fill(null));
        state.selectedPion = null;
        hideContextMenu();
        renderBoard();
        saveState();
    }
}

// Gérer l'undo
function handleUndo() {
    if (state.history.length > 0) {
        const previousState = state.history.pop();
        state.board = previousState.board;
        state.selectedPion = null;
        hideContextMenu();
        renderBoard();
        saveState();
    }
}

// Sauvegarder l'état actuel dans l'historique
function saveState() {
    // Sauvegarder une copie profonde du tableau
    const boardCopy = state.board.map(row => row.map(cell => cell ? { ...cell } : null));
    state.history.push({ board: boardCopy });
    
    // Limiter l'historique à 50 états
    if (state.history.length > 50) {
        state.history.shift();
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('pionBoardState', JSON.stringify({
        board: state.board,
        selectedColor: state.selectedColor,
        selectedSize: state.selectedSize
    }));
}

// Charger l'état depuis localStorage
function loadState() {
    const saved = localStorage.getItem('pionBoardState');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.board) {
                state.board = parsed.board;
            }
            if (parsed.selectedColor) {
                state.selectedColor = parsed.selectedColor;
                document.querySelector(`[data-color="${parsed.selectedColor}"]`)?.classList.add('active');
                document.querySelectorAll('.color-btn').forEach(btn => {
                    if (btn.dataset.color !== parsed.selectedColor) {
                        btn.classList.remove('active');
                    }
                });
            }
            if (parsed.selectedSize) {
                state.selectedSize = parsed.selectedSize;
                document.querySelector(`[data-size="${parsed.selectedSize}"]`)?.classList.add('active');
                document.querySelectorAll('.size-btn').forEach(btn => {
                    if (btn.dataset.size !== parsed.selectedSize) {
                        btn.classList.remove('active');
                    }
                });
            }
        } catch (e) {
            console.error('Erreur lors du chargement de l\'état:', e);
        }
    }
}

// Détecter et mettre en évidence les pions identiques
function highlightMatchingPions() {
    // Retirer toutes les classes de couleur des cellules
    document.querySelectorAll('.cell').forEach(cell => {
        cell.classList.remove('cell-red', 'cell-yellow', 'cell-green', 'cell-blue');
    });
    
    // Compter les pions par couleur et taille
    const pionCounts = {};
    
    // Parcourir le tableau pour compter les pions
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 4; col++) {
            const pion = state.board[row][col];
            if (pion) {
                const key = `${pion.color}-${pion.size}`;
                if (!pionCounts[key]) {
                    pionCounts[key] = [];
                }
                pionCounts[key].push({ row, col });
            }
        }
    }
    
    // Appliquer la couleur aux cellules qui ont au moins 2 pions identiques
    Object.keys(pionCounts).forEach(key => {
        const positions = pionCounts[key];
        if (positions.length >= 2) {
            const color = key.split('-')[0];
            positions.forEach(({ row, col }) => {
                const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
                if (cell) {
                    cell.classList.add(`cell-${color}`);
                }
            });
        }
    });
}

// Rendre le tableau
function renderBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const pion = state.board[row][col];
        
        // Nettoyer la cellule
        cell.innerHTML = '';
        
        // Ajouter le pion si présent
        if (pion) {
            const pionElement = document.createElement('img');
            pionElement.className = `pion ${pion.color} ${pion.size}`;
            // Construire le chemin de l'image selon la taille et la couleur
            const colorMap = {
                'red': 'rouge',
                'yellow': 'jaune',
                'green': 'vert',
                'blue': 'bleu'
            };
            const sizeMap = {
                'small': 'petit',
                'medium': 'moyen',
                'large': 'grand'
            };
            const imagePath = `${sizeMap[pion.size]}/${colorMap[pion.color]}.png`;
            pionElement.src = imagePath;
            pionElement.alt = `Pion ${pion.color} ${pion.size}`;
            pionElement.draggable = false;
            cell.appendChild(pionElement);
        }
    });
    
    // Mettre en évidence les pions identiques
    highlightMatchingPions();
    
    // Mettre à jour l'état du bouton undo
    document.getElementById('undoBtn').disabled = state.history.length === 0;
}

// Sauvegarder automatiquement lors des changements
window.addEventListener('beforeunload', () => {
    saveState();
});

// Sauvegarder périodiquement
setInterval(() => {
    saveState();
}, 5000);

