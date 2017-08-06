import _ from '../../../lib/lodash';
import FactionIDs from '../../config/factionIds';
import CommandIDs from '../../config/commandIds';
import SpecialAbilityIDs from 'fallingsky/config/specialAbilityIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import EnemyFactionPriority from 'fallingsky/bots/romans/enemyFactionPriority';
import Build from '../../commands/romans/build';
import RemoveResources from 'fallingsky/actions/removeResources';
import PlaceFort from 'fallingsky/actions/placeFort';
import PlaceAlliedTribe from 'fallingsky/actions/placeAlliedTribe';
import RemovePieces from 'fallingsky/actions/removePieces';


class RomanBuild {
    static build(state, modifiers) {
        if (state.romans.resources() < 6) {
            return false;
        }

        const executableBuilds = this.getExecutableBuilds(state, modifiers);
        if (executableBuilds.length === 0) {
            return false;
        }

        state.turnHistory.getCurrentTurn().startSpecialAbility(SpecialAbilityIDs.BUILD);
        _.each(executableBuilds, (build) => {
            if(!modifiers.free) {
                RemoveResources.execute(state, {factionId: FactionIDs.ROMANS, count: 2});
            }

            if(build.willPlaceFort) {
                PlaceFort.execute(state, { factionId: FactionIDs.ROMANS, regionId: build.region.id});
            }
            else if(build.willRemoveAlly) {
                const ally = _.find(build.region.getAlliesAndCitadels(), piece=>piece.tribeId === build.tribeId);
                RemovePieces.execute(state, {factionId: ally.factionId, regionId: build.region.id, pieces: [ally]});
            }
            else if(build.willPlaceAlly) {
                const tribe = _(build.region.subduedTribesForFaction(FactionIDs.ROMANS)).sortBy(tribe=>tribe.isCity).first();
                PlaceAlliedTribe.execute(state, {factionId: FactionIDs.ROMANS, regionId: build.region.id, tribeId: tribe.id});
            }
        });

        state.turnHistory.getCurrentTurn().commitSpecialAbility();

        return true;
    }

    static getExecutableBuilds(state, modifiers) {
        const seizeRegions = modifiers.context.seizeRegions || [];
        const possibleBuilds = _.shuffle(Build.test(state));

        const agreementsNeeded = _(possibleBuilds).map('agreementsNeeded').flatten().uniq().value();
        const agreements = state.playersByFaction[FactionIDs.ROMANS].getSupplyLineAgreements(state, modifiers, agreementsNeeded);

        const allowedBuilds = _.filter(possibleBuilds, build=> {
            const supplied = build.region.hasValidSupplyLine(FactionIDs.ROMANS,agreements);
            return build.hasAlly || supplied;
        });


        const fortPlacements = this.getFortPlacements(state, allowedBuilds);
        const allyRemovals = this.getAllyRemovals(state, allowedBuilds, fortPlacements, seizeRegions);
        const allyPlacements = this.getAllyPlacements(state, allowedBuilds, fortPlacements, seizeRegions);

        const allBuilds = _.concat(fortPlacements, allyRemovals, allyPlacements);

        const paidBuilds = modifiers.free ? allBuilds : _.reduce(allBuilds, (accumulator, build) => {
            if (accumulator.resourcesRemaining >= 6) {
                accumulator.resourcesRemaining -= 2;
                accumulator.builds.push(build);
            }
            return accumulator
        }, {resourcesRemaining: state.romans.resources(), builds: []}).builds;

        return state.hasShadedCapability(CapabilityIDs.TITUS_LABIENUS) ? _.take(paidBuilds, 1) : paidBuilds
    }

    static getFortPlacements(state, possibleBuilds) {
        return _(possibleBuilds).map((build) => {
            if (!build.canPlaceFort) {
                return;
            }

            const hasEnemyWithEnoughWarbands = _.find(FactionIDs,
                                                      factionId => factionId !== FactionIDs.ROMANS && build.region.getWarbandsOrAuxiliaForFaction(
                                                          factionId).length > 3);
            if (!hasEnemyWithEnoughWarbands) {
                return;
            }

            return {
                region: build.region,
                willPlaceFort: true
            }
        }).compact().take(state.romans.availableForts().length).value();
    }

    static getAllyRemovals(state, possibleBuilds, fortPlacements, seizeRegions) {
        const enemyFactionPriority = this.getEnemyFactionPriority(state);
        return _(possibleBuilds).map((build) => {
            if (!build.canRemoveAlly) {
                return;
            }

            if (_.indexOf(seizeRegions, build.region.id) >= 0) {
                return;
            }

            if (build.requiresFortForControl && !_.find(fortPlacements,
                                                        placement => placement.region.id === build.region.id)) {
                return;
            }

            const tribe = _(build.region.tribes()).reject(tribe=>tribe.alliedFactionId() === FactionIDs.ROMANS).sortBy(
                tribe => _.findIndex(enemyFactionPriority, tribe.alliedFactionId())).first();




            return {
                region: build.region,
                willRemoveAlly: true,
                tribeId: tribe.id,
                priority: _.findIndex(enemyFactionPriority, tribe.alliedFactionId())
            }
        }).compact().sortBy('priority').value();
    }

    static getAllyPlacements(state, possibleBuilds, fortPlacements, seizeRegions) {
        return _(possibleBuilds).map((build) => {
            if (!build.canPlaceAlly) {
                return;
            }

            if (_.indexOf(seizeRegions, build.region.id) >= 0) {
                return;
            }

            if (build.requiresFortForControl && !_.find(fortPlacements,
                                                        placement => placement.region.id === build.region.id)) {
                return;
            }

            return {
                region: build.region,
                willPlaceAlly: true,
            }
        }).compact().take(state.romans.availableAlliedTribes().length).value();
    }

    static getEnemyFactionPriority(state) {
        return _.sortBy(FactionIDs, factionId => (50 - state.factionsById[factionId].victoryMargin(state)) + '-' +
                                                 (state.playersByFaction[factionId].isNonPlayer ? 'b' : 'a') + '-' +
                                                 EnemyFactionPriority[factionId]);
    }

}

export default RomanBuild