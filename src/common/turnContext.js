import _ from 'lib/lodash';
import CommandIDs from 'fallingsky/config/commandIds';
import RegionIDs from 'fallingsky/config/regionIds';

import uuidv4 from 'uuid';

class TurnContext {
    constructor(definition = {}) {
        this.id = definition.id || uuidv4();
        this.limited = definition.limited;
        this.allowLimitedSpecial = definition.allowLimitedSpecial;
        this.noSpecial = definition.noSpecial;
        this.noEvent = definition.noEvent;
        this.outOfSequence = definition.outOfSequence;
        this.free = definition.free;
        this.winter = definition.winter;
        this.context = definition.context || {};
        this.currentFactionId = definition.currentFactionId;

        this.allowedRegions = _(RegionIDs).values().filter(function(regionId) {
            return !definition.allowedRegions || _.indexOf(definition.allowedRegions , regionId) >= 0;
        }).reject(function(regionId) {
            return definition.restrictedRegions && _.indexOf(definition.restrictedRegions, regionId) >= 0;
        }).value();

        this.allowedCommands = _(CommandIDs).values().filter(function(commandId) {
            return !definition.allowedCommands || _.indexOf(definition.allowedCommands , commandId) >= 0;
        }).reject(function(commandId) {
            return definition.restrictedCommands && _.indexOf(definition.restrictedCommands, commandId) >= 0;
        }).value();
    }

    toJSON() {
        return {
            id: this.id,
            limited: this.limited,
            allowLimitedSpecial: this.allowLimitedSpecial,
            noSpecial: this.noSpecial,
            noEvent: this.noEvent,
            outOfSequence: this.outOfSequence,
            free: this.free,
            winter: this.winter,
            context: this.context,
            currentFactionId: this.currentFactionId,
            allowedRegions: this.allowedRegions,
            allowedCommands: this.allowedCommands
        };
    }

    loadGameState(json) {
        const self = this;
        
        self.id = json.id;
        self.limited = json.limited || false;
        self.allowLimitedSpecial = json.allowLimitedSpecial || false;
        self.noSpecial = json.noSpecial || false;
        self.noEvent = json.noEvent || false;
        self.outOfSequence = json.outOfSequence || false;
        self.free = json.free || false;
        self.winter = json.winter || false;
        self.context = json.context || {};
        self.currentFactionId = json.currentFactionId || null;
        self.allowedRegions = json.allowedRegions;
        self.allowedCommands = json.allowedCommands;
    }

    canDoSpecial() {
        return !this.noSpecial && (!this.limited || this.allowLimitedSpecial);
    }

    isCommandAllowed(commandId) {
        return _.indexOf(this.allowedCommands, commandId) >= 0;
    }

    isRegionAllowed(regionId) {
        return _.indexOf(this.allowedRegions, regionId) >= 0;
    }

    getContextValue( key ) {
        return this.context[key];
    }

    asTest() {
        const testVersion = _.cloneDeep(this);
        testVersion.test = true;
        return testVersion;
    }
}

export default TurnContext;