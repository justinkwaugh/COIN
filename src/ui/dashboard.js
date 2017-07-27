import ko from 'lib/knockout';
import Game from 'fallingsky/game';
import TheGreatRevolt from 'fallingsky/scenarios/theGreatRevolt';
import FactionIDs from 'fallingsky/config/factionIds';
import Events from 'fallingsky/util/events';

const ActivePanelIDs = {
    BOARD: 'board',
    REGIONS: 'regions',
    FACTIONS: 'factions',
    CAPABILITIES: 'capabilities'
};


class Dashboard {
    constructor() {
        this.game = ko.observable(new Game({scenario: TheGreatRevolt}));
        this.agreement = ko.observable(null);

        this.activePanel = ko.observable(ActivePanelIDs.REGIONS);
        this.ActivePanelIDs = ActivePanelIDs;

        Events.on('PlayerInteractionRequested', (interaction) => {
            this.agreement(interaction);
        });
    }

    setActivePanel(newPanel) {
        this.activePanel(newPanel);
    }

    start() {
        this.game().start();
    }

    drawCard() {
        this.game().drawCard();
    }

    agree() {
        const agreement = this.agreement();
        this.agreement(null);
        agreement.status = 'agreed';
        this.game().resumeTurn(agreement);
    }

    refuse() {
        const agreement = this.agreement();
        this.agreement(null);
        agreement.status = 'refused';
        this.game().resumeTurn(agreement);
    }

    nextTurn() {
        this.game().nextTurn();
    }

    canUndo() {
        return this.game().canUndo();
    }

    undo() {
        this.game().undo();
    }

    run() {
        this.game().run();
    }

    stop() {
        this.game().stop();
    }

    styleSuffixForFaction(factionId) {
        if(factionId === FactionIDs.ROMANS) {
            return 'danger';
        }
        else if(factionId === FactionIDs.BELGAE) {
            return 'warning';
        }
        else if(factionId === FactionIDs.AEDUI) {
            return 'info';
        }
        else if(factionId === FactionIDs.ARVERNI) {
            return 'success';
        }
        else if(factionId === FactionIDs.GERMANIC_TRIBES) {
            return 'default';
        }
        else {
            return 'default';
        }
    }
}

export default Dashboard;