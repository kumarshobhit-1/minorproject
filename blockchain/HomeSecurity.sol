// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract HomeSecurity {

    struct Log {
        string action;
        string user;
        uint256 timestamp;
    }

    Log[] public securityLogs;

    address public owner;

    event LogAdded(string action, string user, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addLog(
        string memory _action,
        string memory _user,
        uint256 _timestamp
    ) public onlyOwner {

        require(bytes(_action).length > 0, "Action required");
        require(bytes(_user).length > 0, "User required");

        require(
            _timestamp <= block.timestamp + 5 minutes,
            "Invalid timestamp"
        );

        securityLogs.push(Log(_action, _user, _timestamp));

        emit LogAdded(_action, _user, _timestamp);
    }

    function getLogs() public view returns (Log[] memory) {
        return securityLogs;
    }

    function addLogAuto(string memory _action) public onlyOwner {
        securityLogs.push(
            Log(_action, toAsciiString(msg.sender), block.timestamp)
        );

        emit LogAdded(_action, toAsciiString(msg.sender), block.timestamp);
    }

    function toAsciiString(address x) internal pure returns (string memory) {
        bytes memory s = new bytes(42);
        s[0] = '0';
        s[1] = 'x';
        for (uint i = 0; i < 20; i++) {
            bytes1 b = bytes1(uint8(uint(uint160(x)) / (2**(8*(19 - i)))));
            bytes1 hi = bytes1(uint8(b) / 16);
            bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
            s[2*i+2] = char(hi);
            s[2*i+3] = char(lo);
        }
        return string(s);
    }

    function char(bytes1 b) internal pure returns (bytes1 c) {
        if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
        else return bytes1(uint8(b) + 0x57);
    }
}