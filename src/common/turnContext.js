import COINObject from 'common/coinObject'
import _ from 'lib/lodash';
import CommandIDs from 'fallingsky/config/commandIds';
import RegionIDs from 'fallingsky/config/regionIds';
import short from 'short-uuid';

class TurnContext extends COINObject {
    constructor(definition = {}) {
        super(definition);

        this.id = definition.id || short().new();
        this.limited = definition.limited;
        this.allowLimitedSpecial = definition.allowLimitedSpecial;
        this.noSpecial = definition.noSpecial;
        this.noEvent = definition.noEvent;
        this.outOfSequence = definition.outOfSequence;
        this.free = definition.free;
        this.winter = definition.winter;
        this.context = COINObject.deserializeCOINObjects(definition.context) || {};
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

TurnContext.registerClass();

export default TurnContext;