import _ from 'lib/lodash';
import FactionIDs from 'fallingsky/config/factionIds';
import CommandIDs from 'fallingsky/config/commandIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import RomanBuild from 'fallingsky/bots/romans/romanBuild';
import Rally from 'fallingsky/commands/rally';
import RemoveResources from 'fallingsky/actions/removeResources';
import FactionActions from 'common/factionActions';
import RomanScout from 'fallingsky/bots/romans/romanScout';

const Checkpoints = {
    PRE_RECRUIT_SPECIAL_CHECK: 'pre-recruit-special'
};


class RomanRecruit {
    static recruit(state, modifiers) {
        const turn = state.turnHistory.getCurrentTurn();
        if (!turn.getCheckpoint(Checkpoints.PRE_RECRUIT_SPECIAL_CHECK)) {
            if(modifiers.canDoSpecial()) {
                modifiers.context.didPreRecruitSpecial = RomanBuild.build(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.PRE_BATTLE_SPECIAL_CHECK);
        }

        const executableRallyRegions = this.getExecutableRallyRegions(state, modifiers);
        if (!this.isRallyEffective(state, executableRallyRegions)) {
            if(modifiers.context.didPreRecruitSpecial) {
                turn.rollbackPriorSpecialAbility();
            }
            return false;
        }

        state.turnHistory.getCurrentTurn().startCommand(CommandIDs.RECRUIT);
        _.each(executableRallyRegions, (rallyRegion) => {
            const cost = state.hasShadedCapability(CapabilityIDs.BALEARIC_SLINGERS) ? 2: rallyRegion.inSupplyLine ? 0 : rallyRegion.cost;
            if (!modifiers.free && cost > 0) {
                RemoveResources.execute(state, {factionId: state.romans.id, count: cost});
            }
            Rally.execute(state, {faction: state.romans, regionResult: rallyRegion});
        });

        state.turnHistory.getCurrentTurn().commitCommand();

        let didSpecial = modifiers.context.didPreRecruitSpecial;
        if (modifiers.canDoSpecial() && !didSpecial) {
            didSpecial = RomanScout.scout(state, modifiers);
        }

        return didSpecial ? FactionActions.COMMAND_AND_SPECIAL : FactionActions.COMMAND;
    }

    static getAllyRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.ROMANS,
            regions: regions
        });
        const allyRegions = _(rallyRegionResults).filter({canAddAlly: true}).shuffle().value();
        _.each(allyRegions, (regionResult) => {
            regionResult.addAlly = true;
        });
        return _.take(allyRegions, state.romans.availableAlliedTribes().length);
    }

    static getAuxiliaRegions(state, modifiers, ralliedRegionIds) {
        const regions = _.filter(state.regions, region => _.indexOf(ralliedRegionIds, region.id) < 0);
        const rallyRegionResults = Rally.test(state, {
            factionId: FactionIDs.ROMANS,
            regions: regions
        });

        let auxiliaRemaining = state.romans.availableAuxilia().length;
        _.each(rallyRegionResults, (regionResult) => {
            regionResult.addNumAuxilia = Math.min(regionResult.canAddNumAuxilia, auxiliaRemaining);
            auxiliaRemaining -= regionResult.addNumAuxilia;
            if(auxiliaRemaining === 0) {
                return false;
            }
        });

        return _(rallyRegionResults).filter(result => result.addNumAuxilia > 0).shuffle().value();
    }

    static isRallyEffective(state, executableRallyRegions) {
        const romans = state.romans;
        let numAlliesAdded = false;
        let numPiecesAdded = 0;
        _.each(
            executableRallyRegions, (regionResult) => {

                if (regionResult.addAlly && romans.availableAlliedTribes().length > 0) {
                    numAlliesAdded += 1;
                    numPiecesAdded += 1;
                    return;
                }

                numPiecesAdded += regionResult.addNumAuxilia;
            });
        return numAlliesAdded >= 2 || numPiecesAdded >= 3;
    }

    static getExecutableRallyRegions(state, modifiers, faction) {
        const ralliedRegions = [];
        const allyRegions = this.getAllyRegions(state, modifiers, ralliedRegions);
        ralliedRegions.push.apply(ralliedRegions, _.map(allyRegions, rallyRegion => rallyRegion.region.id));
        const auxiliaRegions = this.getAuxiliaRegions(state, modifiers, ralliedRegions);

        const allRegions = _(allyRegions).concat(auxiliaRegions).value();

        _.each(allRegions, (regionResult) => {
            const agreementsForSupplyLine = regionResult.region.getAgreementsNeededForSupplyLine(FactionIDs.ROMANS);
            if (agreementsForSupplyLine.length === 0) {
                regionResult.inSupplyLine = true;
            }
            regionResult.agreementsNeeded = agreementsForSupplyLine;
        });

        const filteredRegions = state.hasShadedCapability(CapabilityIDs.BALEARIC_SLINGERS) ? _.filter(allRegions, {inSupplyLine: true}) : allRegions;

        const affordableRegions = modifiers.free ? allRegions : _.reduce(allRegions, (accumulator, rallyRegion) => {
            const cost = state.hasShadedCapability(CapabilityIDs.BALEARIC_SLINGERS) ? 2 : rallyRegion.cost;
            if (accumulator.resourcesRemaining >= cost) {
                accumulator.resourcesRemaining -= cost;
                accumulator.rallies.push(rallyRegion);
            }
            return accumulator
        }, {resourcesRemaining: state.romans.resources(), rallies: []}).rallies;

        return modifiers.limited ? _.take(affordableRegions, 1) : affordableRegions;
    }

}

export default RomanRecruit