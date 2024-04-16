import React from "react";
import { ModalFooter } from "@chakra-ui/react";
import { ButtonGroup, Button } from "@chakra-ui/react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";

const Footer = ({ closeModal, locationId, deletePin }) => {
  async function deleteAll() {
    try {
      const response = await fetch(
        `https://memorymap.xyz/api/locations/${locationId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.text();
      console.log(data);
      // Call deletePin after the response is okay
      deletePin();
    } catch (error) {
      console.error(`Fetch Error: ${error}`);
    }
  }

  return (
    <ModalFooter>
      <AlertDialog.Root>
        <ButtonGroup>
          <AlertDialog.Trigger asChild>
            <Button color="white" bg="red.500">
              Delete Pin
            </Button>
          </AlertDialog.Trigger>
          <Button onClick={closeModal} colorScheme="gray">
            Done
          </Button>
        </ButtonGroup>

        <AlertDialog.Portal>
          <AlertDialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
          <AlertDialog.Content
            className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-black p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none text-white"
            style={{ zIndex: 2000 }}
          >
            <AlertDialog.Title className="m-0 text-[17px] font-medium">
              Are you absolutely sure?
            </AlertDialog.Title>
            <AlertDialog.Description className="mt-4 mb-5 text-[15px] leading-normal">
              This action cannot be undone. This will permanently delete your
              pin and remove your images from our servers.
            </AlertDialog.Description>
            <div className="flex justify-end gap-[25px]">
              <AlertDialog.Cancel asChild>
                <button className="text-white bg-gray-500 hover:bg-gray-600 focus:shadow-gray-700 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={deleteAll}
                  className="text-white bg-red-500 hover:bg-red-600 focus:shadow-red-700 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none outline-none focus:shadow-[0_0_0_2px]"
                >
                  Yes, delete pin
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ModalFooter>
  );
};

export default Footer;
