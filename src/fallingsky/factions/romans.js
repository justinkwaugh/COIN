import _ from '../../lib/lodash';
import ko from '../../lib/knockout';
import FallingSkyFaction from './fallingSkyFaction';
import RegionIDs from '../config/regionIds';
import FactionIDs from '../config/factionIds';
import Auxilia from '../pieces/auxilia';
import Fort from '../pieces/fort';
import Legion from '../pieces/legion';
import SenateApprovalStates from '../config/senateApprovalStates';


class Romans extends FallingSkyFaction {
    constructor() {
        const definition = {
            id: FactionIDs.ROMANS,
            name: 'Romans',
            numWarbands: 0,
            numAlliedTribes: 6,
            numCitadels: 0,
            hasLeader: true,
            leaderName: 'Julius Caesar',
            passResources: 2
        };
        super(definition);

        this.availableAuxilia = ko.observableArray(
            _.map(
                _.range(20), function () {
                    return new Auxilia({factionId: definition.id});
                }));

        this.availableForts = ko.observableArray(
            _.map(
                _.range(6), function () {
                    return new Fort({factionId: definition.id});
                }));

        this.availableLegions = ko.observableArray(
            _.map(
                _.range(12), function () {
                    return new Legion({factionId: definition.id});
                }));

        this.availableDispersalTokens = ko.observable(4);

        this.senateApprovalState = ko.observable();
        this.senateFirm = ko.observable();

        this.uproarLegions = ko.observableArray();
        this.intrigueLegions = ko.observableArray();
        this.adulationLegions = ko.observableArray();
        this.fallenLegions = ko.observableArray();

        this.offMapLegions = ko.pureComputed(
            () => {
                return this.availableLegions().length +
                       this.fallenLegions().length +
                       this.adulationLegions().length +
                       this.intrigueLegions().length +
                       this.uproarLegions().length;
            });
    }

    victoryMargin(state) {
        return this.victoryScore(state) - 15;
    }

    victoryScore(state) {
        return _.reduce(
            state.tribes, function (sum, tribe) {
                if (tribe.isDispersed() || tribe.isSubdued() || (tribe.isAllied() && tribe.alliedFactionId() === FactionIDs.ROMANS)) {
                    return sum + 1;
                }
                return sum;
            }, 0);
    }

    isHomeRegion(region) {
        return region.id === RegionIDs.PROVINCIA;
    }

    setSenateApproval(state) {
        this.senateApprovalState(state);
    }

    hasAvailableAuxilia(count) {
        return count <= this.availableAuxilia().length;
    }

    removeAuxilia(count) {
        return this.availableAuxilia.splice(0, count);
    }

    returnAuxilia(auxilia) {
        _.each(
            auxilia, function (piece) {
                piece.revealed(false);
            });
        this.availableAuxilia.push.apply(this.availableAuxilia, auxilia);
    }

    hasAvailableForts() {
        return this.availableForts().length > 0;
    }

    removeFort() {
        return this.availableForts.pop();
    }

    returnFort(fort) {
        this.availableForts.push(fort);
    }

    initializeLegionTrack(state, count) {
        const legions = this.removeLegions(count);
        if (state === SenateApprovalStates.UPROAR) {
            this.uproarLegions.push.apply(this.uproarLegions, legions);
        }
        if (state === SenateApprovalStates.INTRIGUE) {
            this.intrigueLegions.push.apply(this.intrigueLegions, legions);
        }
        if (state === SenateApprovalStates.ADULATION) {
            this.adulationLegions.push.apply(this.adulationLegions, legions);
        }
    }

    hasAvailableLegions(count) {
        let availableCount = this.availableLegions().length;

        if (this.senateApprovalState() >= SenateApprovalStates.UPROAR) {
            availableCount += this.uproarLegions().length;
        }
        if (this.senateApprovalState() >= SenateApprovalStates.INTRIGUE) {
            availableCount += this.intrigueLegions().length;
        }
        if (this.senateApprovalState() === SenateApprovalStates.ADULATION) {
            availableCount += this.adulationLegions().length;
        }
        return count <= availableCount;
    }

    getLegionsFromFallen(count) {
        return this.fallenLegions.splice(0, count);
    }

    removeLegions(count) {
        const removedLegions = [];
        let numLeft = count;
        let currentNumToRemove = 0;
        if (this.availableLegions().length > 0) {
            currentNumToRemove = Math.min(this.availableLegions().length, numLeft);
            removedLegions.push.apply(removedLegions, this.availableLegions.splice(0, currentNumToRemove));
            numLeft -= currentNumToRemove;
        }
        if (numLeft && this.senateApprovalState() >= SenateApprovalStates.UPROAR) {
            currentNumToRemove = Math.min(this.uproarLegions().length, numLeft);
            removedLegions.push.apply(removedLegions, this.uproarLegions.splice(0, currentNumToRemove));
            numLeft -= currentNumToRemove;
        }
        if (numLeft && this.senateApprovalState() >= SenateApprovalStates.INTRIGUE) {
            currentNumToRemove = Math.min(this.intrigueLegions().length, numLeft);
            removedLegions.push.apply(removedLegions, this.intrigueLegions.splice(0, currentNumToRemove));
            numLeft -= currentNumToRemove;
        }
        if (numLeft && this.senateApprovalState() >= SenateApprovalStates.ADULATION) {
            currentNumToRemove = Math.min(this.adulationLegions().length, numLeft);
            removedLegions.push.apply(removedLegions, this.adulationLegions.splice(0, currentNumToRemove));
            numLeft -= currentNumToRemove;
        }
        return removedLegions;
    }

    returnLegions(legions) {
        this.fallenLegions.push.apply(this.fallenLegions, legions);
    }

    hasAvailableDispersalTokens() {
        return this.availableDispersalTokens() > 0;
    }

    removeDispersalToken() {
        this.availableDispersalTokens(this.availableDispersalTokens() - 1);
    }

    returnDispersalToken() {
        this.availableDispersalTokens(this.availableDispersalTokens() + 1);
    }

    adjustSenateApproval(state) {
        const romanVictory = this.victoryScore(state);
        const currentSenateApproval = this.senateApprovalState();

        let newSenateApproval = null;
        if (romanVictory < 10) {
            newSenateApproval = SenateApprovalStates.UPROAR;
        }
        else if (romanVictory < 13) {
            newSenateApproval = SenateApprovalStates.INTRIGUE;
        }
        else {
            newSenateApproval = SenateApprovalStates.ADULATION;
        }

        if (newSenateApproval > currentSenateApproval) {
            if (this.fallenLegions().length > 0) {
                console.log('No change in approval due to fallen legions');
            }
            else if (currentSenateApproval === SenateApprovalStates.UPROAR && this.senateFirm()) {
                this.senateFirm(false);
            }
            else {
                this.senateApprovalState(currentSenateApproval + 1);
            }
        }
        else if (currentSenateApproval === SenateApprovalStates.ADULATION) {
            this.senateFirm(true);
        }
        else if (currentSenateApproval === SenateApprovalStates.UPROAR) {
            this.senateFirm(true);
        }
        else if (newSenateApproval < currentSenateApproval) {
            if (currentSenateApproval === SenateApprovalStates.ADULATION && this.senateFirm()) {
                this.senateFirm(false);
            }
            else {
                this.senateApprovalState(currentSenateApproval - 1);
            }
        }
        this.logSenateApproval();
    }

    returnLegionsFromFallen(args = { spring: false }) {
        const spring = args.spring;
        const numFallenLegions = this.fallenLegions().length;
        const numRemaining = spring ? numFallenLegions : Math.floor(numFallenLegions/2.0);
        let remaining = numFallenLegions - numRemaining;

        let numToReturn = 0;
        if(this.adulationLegions().length < 4) {
            const numSlots = 4-this.adulationLegions().length;
            numToReturn = Math.min(numSlots, remaining);
            this.adulationLegions.push.apply(this.adulationLegions, this.fallenLegions.splice(0, numToReturn));
            remaining -= numToReturn;
        }
        if(remaining && this.intrigueLegions().length < 4) {
            const numSlots = 4-this.intrigueLegions().length;
            numToReturn = Math.min(numSlots, remaining);
            this.intrigueLegions.push.apply(this.intrigueLegions, this.fallenLegions.splice(0, numToReturn));
            remaining -= numToReturn;
        }
        if(remaining && this.uproarLegions().length < 4) {
            const numSlots = 4-this.uproarLegions().length;
            numToReturn = Math.min(numSlots, remaining);
            this.uproarLegions.push.apply(this.uproarLegions, this.fallenLegions.splice(0, numToReturn));
        }
    }

    placeWinterAuxilia(state) {
        const provincia = state.regionsById[RegionIDs.PROVINCIA];
        const leaderInProvincia = _.find(provincia.piecesByFaction[FactionIDs.ROMANS], {type:'leader'});
        if(leaderInProvincia && this.availableAuxilia().length > 0) {
            if(this.senateApprovalState() === SenateApprovalStates.UPROAR) {
                PlaceAuxilia.execute(state, { factionId: this.id, regionId: provincia.id, count: Math.min(3, this.availableAuxilia().length)});
            }
            else if(this.senateApprovalState() === SenateApprovalStates.INTRIGUE) {
                PlaceAuxilia.execute(state, { factionId: this.id, regionId: provincia.id, count: Math.min(4, this.availableAuxilia().length)});
            }
            else if(this.senateApprovalState() === SenateApprovalStates.ADULATION) {
                PlaceAuxilia.execute(state, { factionId: this.id, regionId: provincia.id, count: Math.min(5, this.availableAuxilia().length)});
            }
        }
    }

    logSenateApproval() {
        let approvalText = 'Senate is in a state of ';
        if (this.senateApprovalState() === SenateApprovalStates.ADULATION) {
            if (this.senateFirm()) {
                approvalText += 'firm adulation';
            }
            else {
                approvalText += 'adulation';
            }
        }
        else if (this.senateApprovalState() === SenateApprovalStates.INTRIGUE) {
            approvalText += 'intrigue';
        }
        if (this.senateApprovalState() === SenateApprovalStates.UPROAR) {
            if (this.senateFirm()) {
                approvalText += 'firm uproar';
            }
            else {
                approvalText += 'uproar';
            }
        }
        console.log(approvalText);
    }

    logState(state) {
        console.log('*** ' + this.name + ' Faction ***');
        if (state) {
            console.log('    Victory Margin: ' + this.victoryMargin(state));
        }
        console.log('    Resources: ' + this.resources());
        console.log('    Available Leader: ' + (this.availableLeader() ? this.availableLeader().toString() : 'None'));
        console.log('    Available Forts: ' + this.availableForts().length);
        console.log('    Available Allies: ' + this.availableAlliedTribes().length);
        console.log('    Available Auxilia: ' + this.availableAuxilia().length);
        console.log('    Senate Approval: ' + this.senateApprovalState() + (this.senateFirm() ? ' Firm' : ''));
        console.log('    Uproar Legions: ' + this.uproarLegions().length);
        console.log('    Intrigue Legions: ' + this.intrigueLegions().length);
        console.log('    Adulation Legions: ' + this.adulationLegions().length);
        console.log('    Fallen Legions: ' + this.fallenLegions().length);
    }
}

export default Romans;