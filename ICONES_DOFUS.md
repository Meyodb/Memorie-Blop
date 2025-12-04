# Guide pour ajouter des icônes de pions Dofus

## Icônes actuellement utilisées

Actuellement, les pions utilisent des emojis stylisés :
- 🔴 Rouge : ⚔ (Épée)
- 🟡 Jaune : 🛡 (Bouclier)
- 🟢 Vert : 🌿 (Feuille)
- 🔵 Bleu : 💧 (Goutte d'eau)

## Comment ajouter de vraies icônes Dofus

### Option 1 : Utiliser des images PNG

1. **Téléchargez des icônes** depuis :
   - [Wiki Dofus](https://wiki-dofus.eu/)
   - [Dofus.com](https://www.dofus.com)
   - Ressources communautaires (vérifiez les droits d'auteur)

2. **Créez un dossier `icons/`** dans votre projet

3. **Modifiez le CSS** pour utiliser les images :

```css
.pion.red::before {
    content: '';
    background-image: url('icons/pion-rouge.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
}

.pion.yellow::before {
    content: '';
    background-image: url('icons/pion-jaune.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
}

.pion.green::before {
    content: '';
    background-image: url('icons/pion-vert.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
}

.pion.blue::before {
    content: '';
    background-image: url('icons/pion-bleu.png');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    width: 100%;
    height: 100%;
}
```

### Option 2 : Utiliser des SVG

Créez des fichiers SVG dans un dossier `icons/` et utilisez-les de la même manière.

### Option 3 : Utiliser des polices d'icônes

Vous pouvez utiliser des polices d'icônes comme Font Awesome avec des classes de personnages Dofus si disponibles.

## Classes de personnages Dofus populaires

- **Iop** (Guerrier) - Rouge
- **Cra** (Archer) - Vert
- **Enutrof** (Chanceux) - Jaune
- **Ecaflip** (Chanceux) - Bleu
- **Pandawa** (Buveur) - Rouge
- **Sacrieur** (Guerrier) - Rouge
- **Osamodas** (Invocateur) - Vert
- **Sram** (Assassin) - Bleu
- **Xelor** (Mage du temps) - Bleu
- **Eniripsa** (Soigneur) - Rose/Vert

## Note sur les droits d'auteur

⚠️ **Important** : Assurez-vous d'avoir les droits d'utilisation des images avant de les intégrer dans votre projet. Les assets de Dofus appartiennent à Ankama.

