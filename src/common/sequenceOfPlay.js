import _ from '../lib/lodash.js';
import ko from '../lib/knockout.js';
import FactionActions from './factionActions';

class SequenceOfPlay {
    constructor(definition) {
        const that = this;

        this.eligibleFactions = ko.observableArray(definition.factions);
        this.ineligibleFactions = ko.observableArray();
        this.passedFactions = ko.observableArray();
        this.forcedEligibleFactionIds = ko.observableArray();

        this.firstFaction = ko.observable();
        this.secondFaction = ko.observable();

        this.firstActionChosen = ko.observable();
        this.secondActionChosen = ko.observable();

        this.availableActions = ko.pureComputed(() => {
            const availableActions = [];
            if (!this.firstActionChosen()) {
                availableActions.push.apply(availableActions, [FactionActions.EVENT, FactionActions.COMMAND, FactionActions.COMMAND_AND_SPECIAL]);
            }
            else if (this.firstActionChosen() === FactionActions.COMMAND_AND_SPECIAL) {
                availableActions.push(FactionActions.EVENT);
                if (true) { // check player
                    availableActions.push(FactionActions.COMMAND_AND_SPECIAL);
                }
                else {
                    availableActions.push(FactionActions.LIMITED_COMMAND);
                }
            }
            else if (this.firstActionChosen() === FactionActions.COMMAND) {
                if (true) { // check player
                    availableActions.push(FactionActions.COMMAND_AND_SPECIAL);
                }
                else {
                    availableActions.push(FactionActions.LIMITED_COMMAND);
                }
            }
            else if (this.firstActionChosen() === FactionActions.EVENT) {
                availableActions.push(FactionActions.COMMAND_AND_SPECIAL);
            }
            return availableActions;
        });
    }

    updateEligibility() {
        _.each(this.passedFactions(), (factionId) => {
                this.eligibleFactions.push(factionId);
            });
        this.passedFactions([]);
        _.each(this.ineligibleFactions(), (factionId) => {
                this.eligibleFactions.push(factionId);
            });

        const newlyIneligible = [];
        if (this.firstFaction()) {
            if(_.indexOf(this.forcedEligibleFactionIds, this.firstFaction().id) >= 0) {
                this.eligibleFactions.push(this.firstFaction());
            }
            else {
                newlyIneligible.push(this.firstFaction());
            }
        }
        if (this.secondFaction()) {
            if(_.indexOf(this.forcedEligibleFactionIds, this.secondFaction().id) >= 0) {
                this.eligibleFactions.push(this.secondFaction());
            }
            else {
                newlyIneligible.push(this.secondFaction());
            }
        }
        this.ineligibleFactions(newlyIneligible);

        this.firstFaction(null);
        this.secondFaction(null);
        this.firstActionChosen(null);
        this.secondActionChosen(null);
        this.forcedEligibleFactionIds([]);
    }

    resetEligibility() {
        this.eligibleFactions.push.apply(this.eligibleFactions, this.ineligibleFactions());
        this.ineligibleFactions([]);
    }

    recordFactionAction(factionId, action) {
        console.log('Faction ' + factionId + ' did action ' + action);
        this.eligibleFactions.remove(factionId);
        if (action === FactionActions.PASS) {
            // Handle resource
            this.passedFactions.push(factionId);
        }
        else if (this.firstFaction()) {
            this.secondActionChosen(action);
            this.secondFaction(factionId);
        }
        else {
            this.firstActionChosen(action);
            this.firstFaction(factionId);
        }
    }

    nextFaction(currentCard) {
        return _.find(
            currentCard.initiativeOrder, (factionId) => {
                return _.indexOf(this.eligibleFactions(), factionId) >= 0;
            });
    }

    remainEligible(factionId) {
        this.forcedEligibleFactionIds.push(factionId);
    }

    logState() {
        console.log('Eligible Factions: ' + _.join(this.eligibleFactions()));
        console.log('Passed Factions: ' + _.join(this.passedFactions()));
        console.log('Ineligible Factions: ' + _.join(this.ineligibleFactions()));
        if (this.firstFaction()) {
            console.log('First Faction:  ' + this.firstFaction() + ' (' + this.firstActionChosen() + ')');
        }
        if (this.secondFaction()) {
            console.log('Second Faction:  ' + this.secondFaction() + ' (' + this.secondActionChosen() + ')');
        }
    }

}

export default SequenceOfPlay;