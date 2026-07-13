# Expose deliberate StyleX override slots

Reusable React components accept typed StyleX overrides only at intentional public slots, with the root as the default and additional slots added for demonstrated consumer needs. Components keep their internal style objects private and do not use arbitrary `className` overrides as their primary composition or theming contract.
