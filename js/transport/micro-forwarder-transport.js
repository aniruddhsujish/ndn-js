/**
 * Copyright (C) 2016 Regents of the University of California.
 * @author: Jeff Thompson <jefft0@remap.ucla.edu>
 * @author: Wentao Shang
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * A copy of the GNU Lesser General Public License is in the file COPYING.
 */

/**
 * A MicroForwarderTransport extends Transport to connect to the browser's
 * micro forwarder service. This assumes that the MicroForwarder extensions has
 * been installed.
 * @constructor
 */
var MicroForwarderTransport = function MicroForwarderTransport()
{
  // Call the base constructor.
  Transport.call(this);

  this.elementReader = null;
  this.connectionInfo = null; // Read by Face.
};

MicroForwarderTransport.prototype = new Transport();
MicroForwarderTransport.prototype.name = "MicroForwarderTransport";

/**
 * Create a new MicroForwarderTransport.ConnectionInfo which extends
 * Transport.ConnectionInfo to hold info for the micro forwarer connection.
 */
MicroForwarderTransport.ConnectionInfo = function MicroForwarderTransportConnectionInfo()
{
  // Call the base constructor.
  Transport.ConnectionInfo .call(this);
};

MicroForwarderTransport.ConnectionInfo.prototype = new Transport.ConnectionInfo();
MicroForwarderTransport.ConnectionInfo.prototype.name = "MicroForwarderTransport.ConnectionInfo";

/**
 * Check if the fields of this MicroForwarderTransport.ConnectionInfo equal the other
 * MicroForwarderTransport.ConnectionInfo.
 * @param {MicroForwarderTransport.ConnectionInfo} The other object to check.
 * @returns {boolean} True if the objects have equal fields, false if not.
 */
MicroForwarderTransport.ConnectionInfo.prototype.equals = function(other)
{
  if (other == null)
    return false;
  return true;
};

MicroForwarderTransport.ConnectionInfo.prototype.toString = function()
{
  return "{}";
};

/**
 * Determine whether this transport connecting according to connectionInfo is to
 * a node on the current machine. Unix transports are always local.
 * @param {MicroForwarderTransport.ConnectionInfo} connectionInfo This is ignored.
 * @param {function} onResult This calls onResult(true) because micro forwarder
 * transports are always local.
 * @param {function} onError This is ignored.
 */
MicroForwarderTransport.prototype.isLocal = function(connectionInfo, onResult, onError)
{
  onResult(true);
};

/**
 * Connect to the micro forwarder according to the info in connectionInfo.
 * Listen on the connection to read an entire packet element and call
 * elementListener.onReceivedElement(element).
 * @param {MicroForwarderTransport.ConnectionInfo} connectionInfo
 * @param {object} elementListener The elementListener with function
 * onReceivedElement which must remain valid during the life of this object.
 * @param {function} onopenCallback Once connected, call onopenCallback().
 * @param {type} onclosedCallback If the connection is closed by the remote host,
 * call onclosedCallback().
 */
MicroForwarderTransport.prototype.connect = function
  (connectionInfo, elementListener, onopenCallback, onclosedCallback)
{
  this.elementReader = new ElementReader(elementListener);

  var thisTransport = this;
  window.addEventListener("message", function(event) {
    // We only accept messages from ourselves
    if (event.source != window)
      return;

    if (event.data.type && (event.data.type == "FromMicroForwarderStub")) {
      thisTransport.elementReader.onReceivedData(new Buffer(event.data.object.data));
    }
  }, false);

  this.connectionInfo = connectionInfo;
  onopenCallback();
};

/**
 * Send the data over the connection created by connect.
 * @param {Buffer} buffer The bytes to send.
 */
MicroForwarderTransport.prototype.send = function(buffer)
{
  if (this.connectionInfo == null) {
    console.log("MicroForwarderTransport connection is not established.");
    return;
  }

  window.postMessage({
    type: "FromMicroForwarderTransport",
    object: buffer.toJSON()
  }, "*");
};
