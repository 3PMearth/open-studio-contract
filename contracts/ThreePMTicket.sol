// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts-upgradeable/token/ERC1155/ERC1155Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";


contract ThreePMTicket is ERC1155Upgradeable, OwnableUpgradeable, PausableUpgradeable, UUPSUpgradeable {
    
    string public name;
    string public symbol;
    string public contractBaseURI;
    address private proxyAddress;
    
    //mapping token id to creator address
    mapping(uint256 => address) public creators;

    /**
    * @dev initialize function
    **/
    function initialize(
        string memory _baseUri,
        string memory _baseContractURI,
        string memory _name,
        string memory _symbol
    ) public initializer {
        __ERC1155_init(_baseUri);
        __Ownable_init();
        __Pausable_init();
        __UUPSUpgradeable_init();
        setBaseContractURI(_baseContractURI);
        name = _name;
        symbol = _symbol;
        proxyAddress = _msgSender();        
    }
    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function _authorizeUpgrade(address _newImplementation) internal override onlyOwner {}

    /**
    * @dev set base token URI
    **/ 
    function setBaseTokenURI(string memory _baseTokenURI) public onlyOwner {
        super._setURI(_baseTokenURI);
    }

    /**
    * @dev set contract metadata URI
    **/ 
    function setBaseContractURI(string memory _baseContractURI) public onlyOwner {
        contractBaseURI = _baseContractURI;
    }    

    // contract metadata for opensea.io
    function contractURI() public view returns (string memory) {
        return contractBaseURI;
    }

    /**
    * @dev set a new proxy address
    **/ 
    function setProxy(
        address newProxy
    ) public onlyOwner {
        proxyAddress = newProxy;
    } 

    /**
    * @dev return the address of proxy
    **/ 
    function getProxy() public view returns (address) {
        return proxyAddress;
    }   

    /**
    * @dev mint token
    **/ 
    function mintMultiToken(
        address _to,
        uint256 _tokenId,
        uint256 _amount
    ) public {
        require( (_msgSender() == proxyAddress) || (_msgSender() == owner()) , "only proxy or owner can mint");
        //set creator address mapping to the _tokenId
        creators[_tokenId] = _to;
        super._mint(_to, _tokenId, _amount, "");
    }

    /**
    * @dev show token craetor of the token ID
    **/
    function getCreator(uint256 _tokenId) public view returns (address) {
        return creators[_tokenId];
    }

    /**
    * @dev change amount of token ID
    **/
    function changeAmount(
        address _to,
        uint256 _tokenId,
        uint256 _amount
    ) public {
        //only owner or creator of the token can change amount
        require( (_msgSender() == creators[_tokenId]) || (_msgSender() == owner()) , "only creator or owner can change amount");
        require(_amount > 0, "amount should be greater than 0");
        require(_to != address(0), "ERC1155: mint to the zero address");

        //get current amount of token ID
        uint256 currentAmount = balanceOf(_to, _tokenId);

        //not allow to change amount to 0 and not same as current amount
        require(_amount != currentAmount, "amount should not be same as current amount");

        //if current amount is less than _amount, mint more token
        if (currentAmount < _amount) {
            super._mint(_to, _tokenId, _amount - currentAmount, "");
        } else {
            //burn tokens
            super._burn(_to, _tokenId, currentAmount - _amount);
        }
    }

    /**
    * @dev burn token
    **/ 
    function burn(address account, uint256 id, uint256 amount) public onlyOwner {
        super._burn(account, id, amount);
    }   

    /**
    * @dev burn token (batch)
    **/ 
    function burn(address account, uint256[] memory ids, uint256[] memory amounts) public onlyOwner {
        super._burnBatch(account, ids, amounts);
    }

    /**
    * @dev pause token
    **/ 
    function pauseToken() public onlyOwner {
        super._pause();
    }

    /**
    * @dev unpause token
    **/ 
    function unpauseToken() public onlyOwner {
        super._unpause();
    }

    /**
     * @dev See {ERC1155-_beforeTokenTransfer}.
     *
     * Requirements:
     *
     * - the contract must not be paused.
     */
    function _beforeTokenTransfer(
        address operator,
        address from,
        address to,
        uint256[] memory ids,
        uint256[] memory amounts,
        bytes memory data
    ) internal virtual override {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);

        require(!paused(), "ERC1155Pausable: token transfer while paused");
    }

    function uri(uint256 _tokenId) public view virtual override returns (string memory) {
        return string(
            abi.encodePacked(
                super.uri(0),
                bytes("/"),
                uint2str(_tokenId)
            )
        );
    }

    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }

        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }

        bytes memory bstr = new bytes(length);
        uint256 k = length;
        j = _i;

        while (j != 0) {
            bstr[--k] = bytes1(uint8(48 + j % 10));
            j /= 10;
        }

        return string(bstr);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155Upgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }


    /**
    * Override isApprovedForAll to auto-approve OS's proxy contract
    * https://docs.opensea.io/docs/polygon-basic-integration
    */
    function isApprovedForAll(
        address _owner,
        address _operator
    ) public override view returns (bool isOperator) {
        // if OpenSea's ERC1155 Proxy Address is detected, auto-return true
       if (_operator == address(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)) {
            return true;
        }
        // for 3PM proxy address
        if (_operator == proxyAddress) {
            return true;
        }
        // otherwise, use the default ERC1155.isApprovedForAll()
        return ERC1155Upgradeable.isApprovedForAll(_owner, _operator);
    }
}