import { useState } from "react"
import { Button, Popover, Portal } from "@chakra-ui/react"

const AsteroidDropdown = ({ asteroids = [], onSelectAsteroid }) => {
  const [selectedAsteroid, setSelectedAsteroid] = useState(null)

  const handleSelect = (asteroid) => {
    setSelectedAsteroid(asteroid)
    if (onSelectAsteroid) onSelectAsteroid(asteroid)
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button variant="solid" colorScheme="blue" size="md" mb={4}>
          {selectedAsteroid ? selectedAsteroid.name : "Select Near Earth Object"}
        </Button>
      </Popover.Trigger>
      <Portal>
        <Popover.Positioner>
          <Popover.Content w="auto" boxShadow="lg" borderRadius="md" p={2}>
            <Popover.Body>
              {asteroids.map((asteroid) => (
                <Button
                  key={asteroid.id}
                  variant="ghost"
                  colorScheme="gray"
                  onClick={() => handleSelect(asteroid)}
                  w="100%"
                  mb={1}
                >
                  {asteroid.name}
                </Button>
              ))}
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Portal>
    </Popover.Root>
  )
}

export default AsteroidDropdown
