import ko from '../../lib/knockout';
import Location from '../../common/location';

    const TribeStates = {
        ALLIED : 'allied',
        CITADEL : 'citadel',
        SUBDUED : 'subdued',
        DISPERSED : 'dispersed',
        DISPERSED_GATHERING : 'dispersedgathering',
        RAZED: 'razed'
    };

    class Tribe extends Location {
        constructor(definition) {
            super(definition);

            // Immutable
            this.isCity = definition.isCity || false;
            this.factionRestriction = definition.factionRestriction || null;
            this.regionId = definition.regionId;

            // Mutable
            this.state = ko.observable(TribeStates.SUBDUED);
            this.alliedFactionId = ko.observable();

            // Computed
            this.isAllied = ko.pureComputed( () => {
                return this.state() === TribeStates.ALLIED;
            });
            this.isCitadel = ko.pureComputed(() => {
                return this.state() === TribeStates.CITADEL;
            });
            this.isSubdued = ko.pureComputed( () => {
                return this.state() === TribeStates.SUBDUED;
            });
            this.isDispersed = ko.pureComputed( () => {
                return this.state() === TribeStates.DISPERSED;
            });
            this.isDispersedGathering = ko.pureComputed( () => {
                return this.state() === TribeStates.DISPERSED_GATHERING;
            });
            this.isRazed = ko.pureComputed( () => {
                return this.state() === TribeStates.RAZED;
            });
        }

        toJSON() {
            return Object.assign(super.toJSON(), {
                state: this.state(),
                alliedFactionId: this.alliedFactionId
            });
        }

        isAlliedToFaction(factionId) {
            return this.isAllied() && this.alliedFactionId() === factionId;
        }

        disperse() {
            this.state(TribeStates.DISPERSED);
        }

        disperseGathering() {
            this.state(TribeStates.DISPERSED_GATHERING);
        }

        raze() {
            this.state(TribeStates.RAZED);
        }

        makeAllied(alliedTribe) {
            alliedTribe.tribeId = this.id;
            this.alliedFactionId(alliedTribe.factionId);
            this.state(TribeStates.ALLIED);
        }

        removeAlly(alliedTribe) {
            alliedTribe.tribeId = null;
            this.alliedFactionId(null);
            this.state(TribeStates.SUBDUED);
        }

        buildCitadel(citadel) {
            citadel.tribeId = this.id;
            this.alliedFactionId(citadel.factionId);
            this.state(TribeStates.CITADEL);
        }

        undisperse(fully) {
            if(fully) {
                this.state(TribeStates.SUBDUED);
            }
            if (this.isDispersed()) {
                this.state(TribeStates.DISPERSED_GATHERING);
            }
            else if (this.isDispersedGathering()) {
                this.state(TribeStates.SUBDUED);
            }
        }

        toString() {
            let value = this.name;
            if (this.isSubdued()) {
                value += ' - Subdued';
            }
            else if (this.isDispersed()) {
                value += ' - Dispersed';
            }
            else if (this.isDispersedGathering()) {
                value += ' - Dispersed / Gathering';
            }
            else if (this.isRazed()) {
                value += ' - Dispersed / Razed';
            }
            else if (this.isAllied()) {
                value += ' - ' + this.alliedFactionId() + ' Ally';
            }
            else if (this.isCitadel()) {
                value += ' - ' + this.alliedFactionId() + ' Citadel';
            }

            return value;
        }
    }

export default Tribe;