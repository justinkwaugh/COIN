import _ from 'lib/lodash';
import Bot from '../bot';
import FactionIDs from '../../config/factionIds';
import RegionIDs from 'fallingsky/config/regionIds';
import RomanEvent from './romanEvent';
import RomanBattle from './romanBattle';
import RomanRecruit from './romanRecruit';
import RomanSeize from './romanSeize';
import RomanMarch from './romanMarch';
import CommandIDs from '../../config/commandIds';
import {CapabilityIDs} from 'fallingsky/config/capabilities';
import FactionActions from '../../../common/factionActions';
import MovePieces from 'fallingsky/actions/movePieces';
import RemovePieces from 'fallingsky/actions/removePieces';
import RemoveResources from 'fallingsky/actions/removeResources';
import Losses from 'fallingsky/util/losses';
import Pass from '../../commands/pass';

const Checkpoints = {
    BATTLE_CHECK: 'battle',
    MARCH_CHECK: 'march',
    RECRUIT_CHECK: 'recruit',
    SEIZE_CHECK: 'seize',
    EVENT_CHECK: 'event',
    RALLY_CHECK: 'rally',
    SPREAD_MARCH_CHECK: 'spread-march',
    FIRST_RAID_CHECK: 'first-raid',
    MASS_MARCH_CHECK: 'mass-march',
    SECOND_RAID_CHECK: 'second-raid'

};


class RomanBot extends Bot {
    constructor() {
        super({factionId: FactionIDs.ROMANS});
    }

    toJSON() {
        return Object.assign(super.toJSON(), {});
    }

    takeTurn(state) {
        let commandAction = null;
        const turn = state.turnHistory.currentTurn;
        const modifiers = turn.getContext();

        if (!turn.getCheckpoint(Checkpoints.BATTLE_CHECK) && modifiers.isCommandAllowed(CommandIDs.BATTLE)) {
            commandAction = RomanBattle.battle(state, modifiers);
        }
        turn.markCheckpoint(Checkpoints.BATTLE_CHECK);

        if (modifiers.context.tryThreatMarch) {
            if (!turn.getCheckpoint(Checkpoints.MARCH_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.MARCH)) {
                commandAction = RomanMarch.march(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.MARCH_CHECK);

            if (!turn.getCheckpoint(Checkpoints.RECRUIT_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.RECRUIT)) {
                commandAction = RomanRecruit.recruit(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.RECRUIT_CHECK);

            if (!turn.getCheckpoint(Checkpoints.SEIZE_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.SEIZE)) {
                commandAction = RomanSeize.seize(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.SEIZE_CHECK);
        }
        else {
            if (!turn.getCheckpoint(
                    Checkpoints.EVENT_CHECK) && !commandAction && !modifiers.noEvent && this.canPlayEvent(
                    state) && RomanEvent.handleEvent(state)) {
                commandAction = FactionActions.EVENT;
            }
            turn.markCheckpoint(Checkpoints.EVENT_CHECK);


            if (!turn.getCheckpoint(Checkpoints.MARCH_CHECK) && !commandAction &&
                state.romans.availableAuxilia().length <= 8 &&
                modifiers.isCommandAllowed(CommandIDs.MARCH)) {
                commandAction = RomanMarch.march(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.MARCH_CHECK);

            if (!turn.getCheckpoint(Checkpoints.RECRUIT_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.RECRUIT)) {
                commandAction = RomanRecruit.recruit(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.RECRUIT_CHECK);

            if (!turn.getCheckpoint(Checkpoints.SEIZE_CHECK) && !commandAction && modifiers.isCommandAllowed(
                    CommandIDs.SEIZE)) {
                commandAction = RomanSeize.seize(state, modifiers);
            }
            turn.markCheckpoint(Checkpoints.SEIZE_CHECK);
        }

        if (!modifiers.outOfSequence) {
            commandAction = commandAction || FactionActions.PASS;

            if (commandAction === FactionActions.PASS) {
                Pass.execute(state, {factionId: FactionIDs.ROMANS});
            }

            state.sequenceOfPlay.recordFactionAction(FactionIDs.ROMANS, commandAction);
        }
        return commandAction;
    }

    willHarass(factionId) {
        return factionId === FactionIDs.ARVERNI;
    }

    willAgreeToSupplyLine(state, factionId) {
        return factionId === FactionIDs.AEDUI && state.playersByFaction[factionId].isNonPlayer;
    }

    willAgreeToRetreat(state, factionId) {
        return factionId === FactionIDs.AEDUI && state.playersByFaction[factionId].isNonPlayer;
    }

    willAgreeToQuarters(state, factionId) {
        return factionId === FactionIDs.AEDUI && state.playersByFaction[factionId].isNonPlayer;
    }

    handleEvent(state, currentCard) {

    }

    quarters(state) {
        const regionsWithSupply = _(state.regions).filter(
            region => !region.devastated() && region.hasValidSupplyLine(this.factionId)).value();

        const regionData = _(state.regions).map(region => {
            const pieces = region.getPiecesForFaction(this.factionId);
            const countByType = _.countBy(pieces, 'type');
            const numFortAndAlly = (countByType.fort) || 0 + (countByType.alliedtribe || 0);
            const numAuxilia = countByType.auxilia || 0;

            const numAuxiliaToMove = Math.max(numAuxilia - numFortAndAlly, 0);
            const numLegionsToMove = countByType.legion || 0;
            if (numAuxiliaToMove + numLegionsToMove === 0) {
                return;
            }

            const hasSupply = region.hasValidSupplyLine(this.factionId);
            const adjacentToSupply = _.intersectionBy(region.adjacent, regionsWithSupply, 'id').length > 0;

            return {
                region,
                devastated: region.devastated(),
                hasAlly: (countByType.alliedtribe || 0) > 0,
                numAuxiliaToMove,
                numLegionsToMove,
                hasSupply,
                adjacentToSupply
            }
        }).compact().value();

        const regionsNeedingSupply = _(regionData).filter(data => !data.hasSupply && !data.adjacentToSupply).value();

        if (regionsNeedingSupply.length > 0) {
            const agreements = this.getSupplyLineAgreements(state, null,
                                                            [FactionIDs.AEDUI, FactionIDs.ARVERNI, FactionIDs.BELGAE]);
            const newRegionsWithSupply = _(state.regions).filter(
                region => !region.devastated() && region.hasValidSupplyLine(this.factionId, agreements)).value();
            _.each(regionData, data => {
                data.hasSupply = data.region.hasValidSupplyLine(this.factionId, agreements);
                data.adjacentToSupply = _.intersectionBy(data.region.adjacent, regionsWithSupply, 'id').length > 0;
            });
        }

        const regionsToMoveToProvincia = _(regionData).filter(
            data => data.region.id !== RegionIDs.PROVINCIA && (data.hasSupply || data.adjacentToSupply)).value();

        _.each(regionsToMoveToProvincia, data => {

            const legions = data.region.getLegions();
            const leader = data.region.getLeaderForFaction(this.factionId);
            const auxilia = _.take(data.region.getWarbandsOrAuxiliaForFaction(this.factionId), data.numAuxiliaToMove);
            const pieces = _([]).concat(legions, [leader], auxilia).compact().value();

            MovePieces.execute(state, {
                sourceRegionId: data.region.id,
                destRegionId: RegionIDs.PROVINCIA,
                pieces: pieces
            });
        });

        const leaderRegion = this.findLeaderRegion(state);
        if (leaderRegion && leaderRegion.id !== RegionIDs.PROVINCIA) {

            MovePieces.execute(state, {
                sourceRegionId: leaderRegion.id,
                destRegionId: RegionIDs.PROVINCIA,
                pieces: [leaderRegion.getLeaderForFaction(this.factionId)]
            });
        }

        // Pay for those staying
        const regionsToStay = _(regionData).filter(
            data => data.region.id !== RegionIDs.PROVINCIA && !data.hasSupply && !data.adjacentToSupply).sortBy(
            data => {
                if (data.hasAlly) {
                    return 'a';
                }
                else if (!data.devastated) {
                    return 'b';
                }
                else {
                    return 'c';
                }
            }).value();

        _.each(regionsToStay, data => {
            const resourcesAvailable = state.romans.resources();
            const legions = data.region.getLegions();
            const auxilia = _.take(data.region.getWarbandsOrAuxiliaForFaction(this.factionId), data.numAuxiliaToMove);
            const pieces = _([]).concat(legions, auxilia).value();
            const orderedPieces = Losses.orderPiecesForRemoval(state, pieces).reverse();
            const pieceCost = (data.hasAlly ? 1 : 2) * (data.devastated ? 1 : 2);

            const winterCampaign = !data.devastated && state.hasUnshadedCapability(CapabilityIDs.WINTER_CAMPAIGN);
            if (winterCampaign) {
                return;
            }

            const numPiecesToPayFor = Math.min(Math.floor(resourcesAvailable / pieceCost), orderedPieces.length);
            if (numPiecesToPayFor > 0) {
                RemoveResources.execute(state, {
                    factionId: this.factionId,
                    count: numPiecesToPayFor * pieceCost
                });
            }

            const piecesToRemove = _(orderedPieces).drop(numPiecesToPayFor).filter(piece => _.random(1, 6) < 4).value();
            if (piecesToRemove.length > 0) {
                RemovePieces.execute(state, {
                    factionId: this.factionId,
                    regionId: data.region.id,
                    pieces: piecesToRemove
                })
            }
        });

    }

    findLeaderRegion(state) {
        return _.find(state.regions, (region) => {
            return _.find(region.piecesByFaction()[this.factionId], {type: 'leader'});
        });
    }

    takePompeyLosses(state) {
        throw Error('Need to implement');
    }

    takeGalliaTogataLosses(state) {
        throw Error('Need to implement');
    }

}

export default RomanBot;
