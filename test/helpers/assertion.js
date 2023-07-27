
function ASSERT_EQ(name, value, expected) {
    //  console.log("    " + name + ": " + value );
      assert.equal( value, expected, name + " was expeced as " + expected );
    }
    
    const PREFIX = "Returned error: VM Exception while processing transaction: ";
    
    // for ganache-cli.
    async function EXPECT_EXCEPT(message, promise) {
        try {
            await promise;
            assert(false, "Expected an error but did not get one");
    //        throw null;
        }
        catch (error) {
            assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
      //      console.log( "    caught expected " + message );
        }
    };
    
    async function EXPECT_NOEXCEPT(promise) {
        try {
            await promise;
        }
        catch (error) {
            console.log( "CAUGHT NOT EXPECTED EXCEPTION: " + error.message );
            throw error;
        }
    };
    
    module.exports = {
        ASSERT_EQ,
        EXPECT_EXCEPT,
        EXPECT_NOEXCEPT,
    };
    