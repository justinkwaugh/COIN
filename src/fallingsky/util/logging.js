import _ from '../../lib/lodash';

class Logging {

    static logPieces(pieces) {
        const piecesByType = _.groupBy(pieces, 'type');

        const leaders = piecesByType.leader;
        _.each(leaders, function (leader) {
                console.log('    ' + leader.toString());
            });

        const citadels = piecesByType.citadel;
        _.each(citadels, function (citadel) {
                console.log('    ' + citadel.tribeId + ' Citadel');
            });

        const forts = piecesByType.fort;
        if (forts) {
            console.log('    Roman Fort');
        }

        const allies = piecesByType.alliedtribe;
        _.each(allies, function (ally) {
                console.log('    ' + ally.tribeId + ' Ally');
            });

        const legions = piecesByType.legion;
        if (legions) {
            console.log('    ' + legions.length + 'x Legions');
        }

        let status;
        const warbands = piecesByType.warband;
        if (warbands) {
            status = _.groupBy(warbands, function (warband) {
                    return warband.revealed() ? 'revealed' : 'hidden';
                });
            console.log(
                '    ' + warbands.length + 'x Warbands (' +
                (status.hidden ? status.hidden.length : 0) + ' hidden, ' +
                (status.revealed ? status.revealed.length : 0) + ' revealed)');
        }

        const auxilia = piecesByType.auxilia;
        if (auxilia) {
            status = _.groupBy(auxilia, function (auxilia) {
                    return auxilia.revealed() ? 'revealed' : 'hidden';
                });
            console.log(
                '    ' + auxilia.length + 'x Auxilia (' +
                (status.hidden ? status.hidden.length : 0) + ' hidden, ' +
                (status.revealed ? status.revealed.length : 0) + ' revealed)');
        }

    }

}

export default Logging;